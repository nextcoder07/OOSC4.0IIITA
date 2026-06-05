import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import bcrypt from 'bcrypt'
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
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? ''
const ADMIN_ROLE = process.env.ADMIN_ROLE ?? 'ADMIN'

// ── Load admin whitelist ───────────────────────────────────────────────────────

let allowedAdmins = []
try {
  allowedAdmins = JSON.parse(
    fs.readFileSync(path.join(__dirname, 'allowedAdmins.json'), 'utf-8'),
  )
} catch (error) {
  console.warn('Could not load allowedAdmins.json:', error.message)
}

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
    const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
    cb(null, safeName)
  },
})
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed.'))
    }
  },
})

// ── Rate limiting ──────────────────────────────────────────────────────────────

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
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
      data: { adminEmail: email || 'unknown', action, resource, ipAddress },
    })
  } catch (error) {
    console.error('Unable to record audit log', error.message)
  }
}

const createAccessToken = (admin) =>
  jwt.sign({ email: admin.email, role: admin.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES })

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

// ── Input sanitization ─────────────────────────────────────────────────────────

const allowedFields = {
  speakers: ['name', 'title', 'bio', 'photoURL', 'sortOrder', 'published'],
  sponsors: ['name', 'logoURL', 'category', 'website', 'sortOrder', 'published'],
  events: ['title', 'description', 'date', 'time', 'type', 'sortOrder', 'published'],
  team: ['name', 'role', 'contact', 'photoURL', 'sortOrder', 'published'],
}

const sanitizeBody = (body, fields) => {
  const clean = {}
  for (const key of fields) {
    if (body[key] !== undefined) {
      clean[key] = body[key]
    }
  }
  // Coerce types
  if (clean.sortOrder !== undefined) clean.sortOrder = Number(clean.sortOrder) || 0
  if (clean.published !== undefined) clean.published = Boolean(clean.published)
  return clean
}

// ── Token blacklist (revoked tokens) ───────────────────────────────────────────

const tokenBlacklist = new Set()

// Periodically clean expired tokens from the blacklist
setInterval(() => {
  tokenBlacklist.forEach((token) => {
    try {
      jwt.verify(token, JWT_SECRET)
    } catch {
      tokenBlacklist.delete(token)
    }
  })
}, 60 * 60 * 1000)

// ── Auth middleware ────────────────────────────────────────────────────────────

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.ooscAccessToken || req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  if (tokenBlacklist.has(token)) {
    return res.status(401).json({ error: 'Session has been revoked. Please login again.' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    req.token = token
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' })
  }
}

// ── Apply rate limiters & static files ─────────────────────────────────────────

app.use('/api', generalLimiter)
app.use('/admin/login', loginLimiter)
app.use('/uploads', express.static(uploadDir))

// ── Auth routes ────────────────────────────────────────────────────────────────

app.get('/admin/me', authMiddleware, async (req, res) => {
  res.json({ email: req.user.email, role: req.user.role })
})

app.post('/admin/login', async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  // Check if email is in the admin whitelist
  if (!allowedAdmins.includes(email)) {
    await recordAudit({
      email,
      action: 'Login rejected — email not in whitelist',
      resource: 'AdminAuth',
      ipAddress: getClientIp(req),
    })
    return res.status(401).json({ error: 'This email is not authorized for admin access.' })
  }

  // Verify password against bcrypt hash
  let passwordValid = false
  try {
    passwordValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)
  } catch {
    return res.status(500).json({ error: 'Authentication service error.' })
  }

  if (!passwordValid) {
    await recordAudit({
      email,
      action: 'Failed login — wrong password',
      resource: 'AdminAuth',
      ipAddress: getClientIp(req),
    })
    return res.status(401).json({ error: 'Invalid password.' })
  }

  const admin = { email, role: ADMIN_ROLE }
  const token = createAccessToken(admin)
  setAuthCookie(res, token)

  await recordAudit({
    email,
    action: 'Logged in',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })

  res.json({ success: true, email, role: ADMIN_ROLE })
})

app.post('/admin/logout', authMiddleware, async (req, res) => {
  // Blacklist the current token so it can't be reused
  tokenBlacklist.add(req.token)
  clearAuthCookie(res)
  await recordAudit({
    email: req.user.email,
    action: 'Logged out',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })
  res.json({ success: true })
})

// ── Generic CRUD factory ───────────────────────────────────────────────────────

const createCrudRoutes = (name, model, orderFields = ['sortOrder'], hasPublished = true) => {
  const fields = allowedFields[name] || []

  app.get(`/api/${name}`, async (req, res) => {
    try {
      const includeDraft = req.query.includeDraft === '1'
      const where = hasPublished && !includeDraft ? { published: true } : undefined
      const opts = { orderBy: orderFields.map((field) => ({ [field]: 'asc' })) }
      if (where) opts.where = where
      const items = await model.findMany(opts)
      res.json(items)
    } catch (error) {
      console.error(`GET /api/${name} failed:`, error.message)
      res.status(500).json({ error: 'Failed to fetch records.' })
    }
  })

  app.post(`/api/${name}`, authMiddleware, async (req, res) => {
    try {
      const data = sanitizeBody(req.body, fields)
      const item = await model.create({ data })
      await recordAudit({
        email: req.user.email,
        action: `Created ${name}`,
        resource: name,
        ipAddress: getClientIp(req),
      })
      res.status(201).json(item)
    } catch (error) {
      console.error(`POST /api/${name} failed:`, error.message)
      res.status(500).json({ error: 'Failed to create record.' })
    }
  })

  app.put(`/api/${name}/:id`, authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id)
      const data = sanitizeBody(req.body, fields)
      const item = await model.update({ where: { id }, data })
      await recordAudit({
        email: req.user.email,
        action: `Updated ${name}`,
        resource: `${name}:${id}`,
        ipAddress: getClientIp(req),
      })
      res.json(item)
    } catch (error) {
      console.error(`PUT /api/${name}/${req.params.id} failed:`, error.message)
      res.status(500).json({ error: 'Failed to update record.' })
    }
  })

  app.delete(`/api/${name}/:id`, authMiddleware, async (req, res) => {
    try {
      const id = Number(req.params.id)
      await model.delete({ where: { id } })
      await recordAudit({
        email: req.user.email,
        action: `Deleted ${name}`,
        resource: `${name}:${id}`,
        ipAddress: getClientIp(req),
      })
      res.json({ success: true })
    } catch (error) {
      console.error(`DELETE /api/${name}/${req.params.id} failed:`, error.message)
      res.status(500).json({ error: 'Failed to delete record.' })
    }
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
    console.error('Registration failed', error.message)
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
