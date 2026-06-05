import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'

import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)


dotenv.config()

const prisma = new PrismaClient()
const app = express()
const port = Number(process.env.PORT ?? 4000)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const COOKIE_SECURE = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET ?? 'oosc-secret'
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET ?? 'oosc-refresh-secret'
const ACCESS_EXPIRES = '24h'
const REFRESH_EXPIRES = '7d'
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? 'ooscadmin'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'VeryStrongPassword123'
const ADMIN_ROLE = process.env.ADMIN_ROLE ?? 'ADMIN'

app.use(helmet())
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)
app.use(express.json())
app.use(cookieParser())

const uploadDir = path.join(__dirname, 'uploads')
fs.mkdirSync(uploadDir, { recursive: true })
const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_.]/g, '_')}`
    cb(null, safeName)
  },
})
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed.'))
    }
  },
})

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 60 * 60,
  },
})

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'

const recordAudit = async ({ email, action, resource, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: {
        adminEmail: email,
        action,
        resource,
        ipAddress,
      },
    })
  } catch (error) {
    console.error('Unable to record audit log', error)
  }
}

const createTokens = (admin) => {
  const accessToken = jwt.sign(
    { username: admin.username, role: admin.role },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES },
  )
  const refreshToken = jwt.sign(
    { username: admin.username },
    REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRES },
  )
  return { accessToken, refreshToken }
}

const setAuthCookies = (res, accessToken, refreshToken) => {
  res.cookie('ooscAccessToken', accessToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  })
  res.cookie('ooscRefreshToken', refreshToken, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

const clearAuthCookies = (res) => {
  res.clearCookie('ooscAccessToken', { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'strict' })
  res.clearCookie('ooscRefreshToken', { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'strict' })
}

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.ooscAccessToken || req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

const createTransporter = () => {
  if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === 'true',
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
    })
  }
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  })
}

const sendAdminEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter()
  return transporter.sendMail({
    from: process.env.EMAIL_FROM || process.env.SMTP_USER || process.env.EMAIL_USER,
    to,
    subject,
    html,
    text,
  })
}

app.use('/api', generalLimiter)
app.use('/admin/login', loginLimiter)

app.use('/uploads', express.static(uploadDir))

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

app.get('/admin/me', authMiddleware, async (req, res) => {
  res.json({ username: req.user.username, role: req.user.role })
})

app.post('/admin/login', csrfProtection, async (req, res) => {
  const username = String(req.body.username || '').trim()
  const password = String(req.body.password || '')

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
  }

  if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
    await recordAudit({
      email: username,
      action: 'Failed login attempt',
      resource: 'AdminAuth',
      ipAddress: getClientIp(req),
    })
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const admin = { username: ADMIN_USERNAME, role: ADMIN_ROLE }
  const { accessToken, refreshToken } = createTokens(admin)
  setAuthCookies(res, accessToken, refreshToken)

  await recordAudit({
    email: ADMIN_USERNAME,
    action: 'Logged in',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })

  res.json({ success: true, role: admin.role, username: admin.username })
})

app.post('/admin/logout', authMiddleware, csrfProtection, async (req, res) => {
  clearAuthCookies(res)
  await recordAudit({
    email: req.user.username,
    action: 'Logged out',
    resource: 'AdminUser',
    ipAddress: getClientIp(req),
  })
  res.json({ success: true })
})

app.post('/admin/refresh', async (req, res) => {
  const refreshToken = req.cookies.ooscRefreshToken
  if (!refreshToken) {
    return res.status(401).json({ error: 'Missing refresh token.' })
  }

  try {
    const payload = jwt.verify(refreshToken, REFRESH_SECRET)
    if (payload.username !== ADMIN_USERNAME) {
      return res.status(401).json({ error: 'Invalid refresh token.' })
    }

    const admin = { username: ADMIN_USERNAME, role: ADMIN_ROLE }
    const { accessToken } = createTokens(admin)
    setAuthCookies(res, accessToken, refreshToken)
    res.json({ success: true })
  } catch (error) {
    clearAuthCookies(res)
    return res.status(401).json({ error: 'Invalid refresh token.' })
  }
})



  res.status(201).json({ success: true, admin: { email: admin.email, role: admin.role } })
})



const createCrudRoutes = (name, model, orderFields = ['sortOrder'], hasPublished = true) => {
  app.get(`/api/${name}`, async (req, res) => {
    const includeDraft = req.query.includeDraft === '1'
    const where = hasPublished && !includeDraft ? { published: true } : undefined
    const opts = { orderBy: orderFields.map((field) => ({ [field]: 'asc' })) }
    if (where) opts.where = where
    const items = await model.findMany(opts)
    res.json(items)
  })

  app.post(`/api/${name}`, authMiddleware, csrfProtection, async (req, res) => {
    const item = await model.create({ data: req.body })
    await recordAudit({
      email: req.user.username,
      action: `Created ${name}`,
      resource: name,
      ipAddress: getClientIp(req),
    })
    res.status(201).json(item)
  })

  app.put(`/api/${name}/:id`, authMiddleware, csrfProtection, async (req, res) => {
    const id = Number(req.params.id)
    const item = await model.update({ where: { id }, data: req.body })
    await recordAudit({
      email: req.user.username,
      action: `Updated ${name}`,
      resource: `${name}:${id}`,
      ipAddress: getClientIp(req),
    })
    res.json(item)
  })

  app.delete(`/api/${name}/:id`, authMiddleware, csrfProtection, async (req, res) => {
    const id = Number(req.params.id)
    await model.delete({ where: { id } })
    await recordAudit({
      email: req.user.username,
      action: `Deleted ${name}`,
      resource: `${name}:${id}`,
      ipAddress: getClientIp(req),
    })
    res.status(204).send()
  })
}

createCrudRoutes('speakers', prisma.speaker, ['sortOrder'], true)
createCrudRoutes('sponsors', prisma.sponsor, ['sortOrder'], true)
createCrudRoutes('events', prisma.event, ['sortOrder'], true)
createCrudRoutes('team', prisma.teamMember, ['sortOrder'], true)
createCrudRoutes('merch', prisma.merchItem, ['id'], true)
createCrudRoutes('faqs', prisma.faq, ['sortOrder'], true)

app.get('/api/content', async (req, res) => {
  const content = await prisma.siteContent.findMany()
  res.json(content)
})

app.post('/api/content', authMiddleware, csrfProtection, async (req, res) => {
  const { key, value } = req.body
  const content = await prisma.siteContent.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  })
  await recordAudit({
    email: req.user.username,
    action: 'Updated content',
    resource: `SiteContent:${key}`,
    ipAddress: getClientIp(req),
  })
  res.json(content)
})

app.patch('/api/:resource/reorder', authMiddleware, csrfProtection, async (req, res) => {
  const { resource } = req.params
  const ids = req.body?.ids
  const models = {
    speakers: prisma.speaker,
    sponsors: prisma.sponsor,
    events: prisma.event,
    team: prisma.teamMember,
  }

  const model = models[resource]
  if (!model || !Array.isArray(ids)) {
    return res.status(400).json({ error: 'Invalid reorder request' })
  }

  const updates = ids.map((id, index) =>
    model.update({ where: { id: Number(id) }, data: { sortOrder: index + 1 } }),
  )

  await Promise.all(updates)
  await recordAudit({
    email: req.user.username,
    action: `Reordered ${resource}`,
    resource,
    ipAddress: getClientIp(req),
  })
  res.json({ success: true })
})

app.post('/api/upload', authMiddleware, csrfProtection, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }

  const fileUrl = `/uploads/${req.file.filename}`
  res.json({ url: fileUrl })
})

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  try {
    await sendAdminEmail({
      to: process.env.EMAIL_TO,
      subject: `OOSC 4.0 contact: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `<p><strong>Name:</strong> ${name}</p><p><strong>Email:</strong> ${email}</p><p>${message}</p>`,
    })
    res.json({ success: true, message: 'Contact message sent successfully.' })
  } catch (error) {
    console.error('Contact email failed', error)
    res.status(500).json({ error: 'Unable to send email at this time.' })
  }
})

app.post('/api/registration', async (req, res) => {
  const { name, email, affiliation, message } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' })
  }

  try {
    await prisma.lead.create({ data: { name, email, affiliation: affiliation || '', message: message || '' } })
    await sendAdminEmail({
      to: process.env.EMAIL_TO,
      subject: `OOSC 4.0 registration: ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nAffiliation: ${affiliation}\n\n${message}`,
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Registration failed', error)
    res.status(500).json({ error: 'Unable to register at this time.' })
  }
})

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', database: !!process.env.DATABASE_URL })
})

app.get('/test', (req, res) => {
  res.json({
    status: 'working'
  })
})

const frontendDist = path.join(__dirname, '../dist')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

app.listen(port, () => {
  console.log(`OOSC backend listening on http://localhost:${port}`)
})
