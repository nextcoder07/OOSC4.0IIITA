import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import rateLimit from 'express-rate-limit'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { PrismaClient } from '@prisma/client'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

const prisma = new PrismaClient()
const app = express()
const port = Number(process.env.PORT ?? 4000)
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const COOKIE_SECURE = process.env.NODE_ENV === 'production'
const JWT_SECRET = process.env.JWT_SECRET ?? 'oosc-secret'
const ACCESS_EXPIRES = '24h'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@oosc.iiita.ac.in'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? 'StrongPassword'
const ADMIN_ROLE = process.env.ADMIN_ROLE ?? 'ADMIN'

// ── Middleware ──────────────────────────────────────────────────────────────────

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

// ── File uploads ───────────────────────────────────────────────────────────────

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

// ── CSRF & rate limiting ───────────────────────────────────────────────────────

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

// ── Helpers ────────────────────────────────────────────────────────────────────

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'

const recordAudit = async ({ email, action, resource, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: { adminEmail: email, action, resource, ipAddress },
    })
  } catch (error) {
    console.error('Unable to record audit log', error)
  }
}

const createAccessToken = (admin) =>
  jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES })

const setAuthCookie = (res, token) => {
  res.cookie('ooscAccessToken', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: 'strict',
    maxAge: 24 * 60 * 60 * 1000,
  })
}

const clearAuthCookie = (res) => {
  res.clearCookie('ooscAccessToken', { httpOnly: true, secure: COOKIE_SECURE, sameSite: 'strict' })
}

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.ooscAccessToken || req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Apply rate limiters & static files ─────────────────────────────────────────

app.use('/api', generalLimiter)
app.use('/admin/login', loginLimiter)
app.use('/uploads', express.static(uploadDir))

// ── CSRF token endpoint ────────────────────────────────────────────────────────

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// ── Auth routes ────────────────────────────────────────────────────────────────

app.get('/admin/me', authMiddleware, async (req, res) => {
  res.json({ username: req.user.username, role: req.user.role })
})

app.post('/admin/login', async (req, res) => {
  const username = String(req.body.email || req.body.username || '').trim()
  const password = String(req.body.password || '')

  if (!username || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  if (username !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
    await recordAudit({
      email: username,
      action: 'Failed login attempt',
      resource: 'AdminAuth',
      ipAddress: getClientIp(req),
    })
    return res.status(401).json({ error: 'Invalid username or password.' })
  }

  const admin = { username: ADMIN_EMAIL, role: ADMIN_ROLE }
  const token = createAccessToken(admin)
  setAuthCookie(res, token)

  await recordAudit({
    email: ADMIN_EMAIL,
    action: 'Logged in',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })

  res.json({ success: true, role: admin.role, username: admin.username })
})

app.post('/admin/logout', authMiddleware, async (req, res) => {
  clearAuthCookie(res)
  await recordAudit({
    email: req.user.username,
    action: 'Logged out',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })
  res.json({ success: true })
})

// ── Generic CRUD factory ───────────────────────────────────────────────────────

const createCrudRoutes = (name, model, orderFields = ['sortOrder'], hasPublished = true) => {
  app.get(`/api/${name}`, async (req, res) => {
    const includeDraft = req.query.includeDraft === '1'
    const where = hasPublished && !includeDraft ? { published: true } : undefined
    const opts = { orderBy: orderFields.map((field) => ({ [field]: 'asc' })) }
    if (where) opts.where = where
    const items = await model.findMany(opts)
    res.json(items)
  })

  app.post(`/api/${name}`, authMiddleware, async (req, res) => {
    const item = await model.create({ data: req.body })
    await recordAudit({
      email: req.user.username,
      action: `Created ${name}`,
      resource: name,
      ipAddress: getClientIp(req),
    })
    res.status(201).json(item)
  })

  app.put(`/api/${name}/:id`, authMiddleware, async (req, res) => {
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

  app.delete(`/api/${name}/:id`, authMiddleware, async (req, res) => {
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

// Register CRUD for models the frontend actually uses
createCrudRoutes('speakers', prisma.speaker)
createCrudRoutes('sponsors', prisma.sponsor)
createCrudRoutes('events', prisma.event)
createCrudRoutes('team', prisma.teamMember)

// ── File upload ────────────────────────────────────────────────────────────────

app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }
  res.json({ url: `/uploads/${req.file.filename}` })
})

// ── Contact form ───────────────────────────────────────────────────────────────

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  // Log the contact message; email integration can be added later
  console.log(`Contact from ${name} (${email}): ${message}`)
  res.json({ success: true, message: 'Contact message received successfully.' })
})

// ── Registration ───────────────────────────────────────────────────────────────

app.post('/api/registration', async (req, res) => {
  const { name, email, affiliation, message } = req.body
  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' })
  }

  try {
    await prisma.lead.create({
      data: { name, email, affiliation: affiliation || '', message: message || '' },
    })
    res.json({ success: true })
  } catch (error) {
    console.error('Registration failed', error)
    res.status(500).json({ error: 'Unable to register at this time.' })
  }
})

// ── Production static serving ──────────────────────────────────────────────────

const frontendDist = path.join(__dirname, '../frontend/dist')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// ── Start ──────────────────────────────────────────────────────────────────────

app.listen(port, () => {
  console.log(`OOSC backend listening on http://localhost:${port}`)
})
