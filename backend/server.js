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
import nodemailer from 'nodemailer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

dotenv.config({ path: path.join(__dirname, '.env') })

// Guarantee SQLite path resolves to backend/prisma/dev.db regardless of cwd
const defaultDbPath = path.join(__dirname, 'prisma', 'dev.db').replace(/\\/g, '/')
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = `file:${defaultDbPath}`
}
// dataproxy engine requires Prisma Accelerate — breaks local SQLite
if (
  process.env.PRISMA_CLIENT_ENGINE_TYPE === 'dataproxy' &&
  process.env.DATABASE_URL.startsWith('file:')
) {
  delete process.env.PRISMA_CLIENT_ENGINE_TYPE
}

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

// ── Middleware & CORS Fix ────────────────────────────────────────────────────────

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" } // Allows frontend to view uploaded images
}))

app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'], // Crucial for CSRF validation
  }),
)
app.use(express.json())
app.use(cookieParser())

// ── File uploads setup ───────────────────────────────────────────────────────────

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

// ── CSRF & Rate Limiting ─────────────────────────────────────────────────────────

const csrfProtection = csurf({
  cookie: {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SECURE ? 'none' : 'lax', // Supports cross-port local cookies easily
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
  max: 200, // Boosted to allow quick heavy asset adjustments
  standardHeaders: true,
  legacyHeaders: false,
})

// ── Helpers ────────────────────────────────────────────────────────────────────

const getClientIp = (req) =>
  req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown'

const recordAudit = async ({ email, action, resource, ipAddress }) => {
  try {
    await prisma.auditLog.create({
      data: { adminEmail: email || 'unknown-admin', action, resource, ipAddress },
    });
  } catch (error) {
    console.error('Unable to record audit log:', error.message)
  }
}

const createAccessToken = (admin) =>
  jwt.sign({ username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES })

const setAuthCookie = (res, token) => {
  res.cookie('ooscAccessToken', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SECURE ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000,
  })
}

const clearAuthCookie = (res) => {
  res.clearCookie('ooscAccessToken', { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SECURE ? 'none' : 'lax' })
}

const authMiddleware = async (req, res, next) => {
  const token = req.cookies.ooscAccessToken || req.headers.authorization?.split(' ')[1]
  if (!token) {
    return res.status(401).json({ error: 'Unauthorized: Missing token.' })
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ error: 'Unauthorized: Invalid token.' })
  }
}

// ── Routing Application Contexts ────────────────────────────────────────────────

app.use('/uploads', express.static(uploadDir))
app.use('/api', generalLimiter)
app.use('/api/admin/login', loginLimiter)

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ ok: true })
  } catch (err) {
    res.status(503).json({ ok: false, error: err.message })
  }
})

// ── CSRF token endpoint ────────────────────────────────────────────────────────

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

// ── Auth routes ────────────────────────────────────────────────────────────────

app.get('/api/admin/me', authMiddleware, async (req, res) => {
  res.json({ username: req.user.username, role: req.user.role })
})

app.post('/api/admin/login', csrfProtection, async (req, res) => {
  const username = String(req.body.username || '').trim()
  const password = String(req.body.password || '')

  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' })
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

app.post('/api/admin/logout', authMiddleware, csrfProtection, async (req, res) => {
  clearAuthCookie(res)
  await recordAudit({
    email: req.user.username,
    action: 'Logged out',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })
  res.json({ success: true })
})

// ── Generic CRUD factory (Protected with verification) ──────────────────────────

const createCrudRoutes = (name, model, orderFields = ['sortOrder'], hasPublished = true) => {
  // Public GET logic
  app.get(`/api/${name}`, async (req, res) => {
    try {
      const includeDraft = req.query.includeDraft === '1'
      const where = hasPublished && !includeDraft ? { published: true } : undefined
      const opts = { orderBy: orderFields.map((field) => ({ [field]: 'asc' })) }
      if (where) opts.where = where
      const items = await model.findMany(opts)
      res.json(items)
    } catch (err) {
      res.status(500).json({ error: `Failed fetching records from ${name}` })
    }
  })

  // Protected POST logic
  app.post(`/api/${name}`, authMiddleware, csrfProtection, async (req, res) => {
    try {
      const item = await model.create({ data: req.body })
      await recordAudit({
        email: req.user.username,
        action: `Created item in ${name}`,
        resource: `${name}`,
        ipAddress: getClientIp(req),
      })
      res.status(201).json(item)
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to create record in ${name}` })
    }
  })

  // Protected REORDER logic
  app.put(`/api/${name}/reorder`, authMiddleware, csrfProtection, async (req, res) => {
    try {
      const items = req.body
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected an array of items to reorder.' })
      }
      await prisma.$transaction(
        items.map((item) =>
          model.update({
            where: { id: Number(item.id) },
            data: { sortOrder: Number(item.sortOrder) },
          })
        )
      )
      await recordAudit({
        email: req.user.username,
        action: `Reordered items in ${name}`,
        resource: `${name}`,
        ipAddress: getClientIp(req),
      })
      res.json({ success: true })
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to reorder records in ${name}` })
    }
  })

  // Protected PUT logic
  app.put(`/api/${name}/:id`, authMiddleware, csrfProtection, async (req, res) => {
    try {
      const id = Number(req.params.id)
      const item = await model.update({ where: { id }, data: req.body })
      await recordAudit({
        email: req.user.username,
        action: `Updated item in ${name}`,
        resource: `${name}:${id}`,
        ipAddress: getClientIp(req),
      })
      res.json(item)
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to update record in ${name}` })
    }
  })

  // Protected DELETE logic
  app.delete(`/api/${name}/:id`, authMiddleware, csrfProtection, async (req, res) => {
    try {
      const id = Number(req.params.id)
      await model.delete({ where: { id } })
      await recordAudit({
        email: req.user.username,
        action: `Deleted item from ${name}`,
        resource: `${name}:${id}`,
        ipAddress: getClientIp(req),
      })
      res.status(204).send()
    } catch (err) {
      res.status(400).json({ error: err.message || `Failed to delete record from ${name}` })
    }
  })
}

// Register CRUD factory targets mapping explicitly to models
createCrudRoutes('speakers', prisma.speaker)
createCrudRoutes('sponsors', prisma.sponsor)
createCrudRoutes('events', prisma.event)
createCrudRoutes('team', prisma.teamMember)

// ── Corrected File Upload Implementation ──────────────────────────────────────────

app.post('/api/upload', authMiddleware, csrfProtection, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }
  res.json({ url: `/uploads/${req.file.filename}` })
})

// ── Contact Form ───────────────────────────────────────────────────────────────

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }
  console.log(`Contact message logged from ${name} (${email}): ${message}`)

  // Retrieve SMTP configuration
  const emailUser = process.env.EMAIL_USER
  const emailPass = process.env.EMAIL_PASS
  const emailFrom = process.env.EMAIL_FROM || emailUser || ADMIN_EMAIL

  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : 587
  const smtpUser = process.env.SMTP_USER || emailUser
  const smtpPass = process.env.SMTP_PASS || emailPass
  const smtpSecure = process.env.SMTP_SECURE === 'true'

  if (emailUser || smtpHost) {
    try {
      let transporter
      if (smtpHost) {
        transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: smtpUser && smtpPass ? {
            user: smtpUser,
            pass: smtpPass
          } : undefined
        })
      } else {
        transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: emailUser,
            pass: emailPass
          }
        })
      }

      await transporter.sendMail({
        from: emailFrom,
        to: emailFrom, // notify admin/site host
        replyTo: email,
        subject: `New OOSC 4.0 Contact Submission from ${name}`,
        text: `You have received a new contact form submission:\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `
          <h3>New OOSC 4.0 Contact Form Submission</h3>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Message:</strong></p>
          <p style="white-space: pre-wrap; background-color: #f1f5f9; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">${message}</p>
        `
      })
      console.log(`Successfully sent contact email notification for ${email}`)
    } catch (emailErr) {
      console.error('Failed to send contact email notification:', emailErr.message)
    }
  } else {
    console.warn('SMTP credentials not configured in environment variables. Email notification skipped.')
  }

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
    console.error('Registration entry writing failed:', error)
    res.status(500).json({ error: 'Unable to process registration data storage.' })
  }
})

// ── Production Static Asset Deploy Environment Mapping ──────────────────────────

const frontendDist = path.join(__dirname, '../dist')
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(frontendDist))
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDist, 'index.html'))
  })
}

// ── Execution Start ──────────────────────────────────────────────────────────────

const start = async () => {
  try {
    await prisma.$connect()
    console.log('Database connected:', process.env.DATABASE_URL)
  } catch (err) {
    console.error('Database connection failed:', err.message)
    console.error('Run: npm run db:sync   then restart the server.')
    process.exit(1)
  }

  app.listen(port, () => {
    console.log(`OOSC backend ready at http://localhost:${port}`)
    console.log(`Frontend proxy target — start Vite with: npm run dev`)
  })
}

start()