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
import xss from 'xss'
import nodemailer from 'nodemailer'
import { v2 as cloudinary } from 'cloudinary'
import { CloudinaryStorage } from 'multer-storage-cloudinary'

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

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "https:", "http:"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        connectSrc: ["'self'", "http://localhost:*", "ws://localhost:*"],
      },
    },
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
    xssFilter: true, // Prevent reflected XSS
    noSniff: true, // Prevent MIME-type sniffing
    frameguard: { action: 'deny' }, // Prevent clickjacking
  })
)
app.use(
  cors({
    origin: CLIENT_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  }),
)
app.use(express.json({ limit: '10kb' })) // Limit body size to prevent DoS
app.use(cookieParser())

// ── XSS Sanitization Middleware ────────────────────────────────────────────────
const sanitizeInput = (obj) => {
  if (typeof obj === 'string') {
    return xss(obj)
  }
  if (Array.isArray(obj)) {
    return obj.map(sanitizeInput)
  }
  if (typeof obj === 'object' && obj !== null) {
    const newObj = {}
    for (const key in obj) {
      newObj[key] = sanitizeInput(obj[key])
    }
    return newObj
  }
  return obj
}

app.use((req, res, next) => {
  if (req.body) req.body = sanitizeInput(req.body)
  if (req.query) req.query = sanitizeInput(req.query)
  if (req.params) req.params = sanitizeInput(req.params)
  next()
})

// ── File uploads ───────────────────────────────────────────────────────────────

let storage
const uploadDir = process.env.VERCEL ? '/tmp/uploads' : path.join(__dirname, 'uploads')

// If Cloudinary credentials exist, use Cloudinary storage
if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  })

  storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: 'oosc-4.0',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    },
  })
} else {
  // Fallback to local storage
  try {
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
  } catch (e) {
    console.warn('Could not create upload directory:', e.message)
  }

  storage = multer.diskStorage({
    destination: uploadDir,
    filename: (req, file, cb) => {
      const safeName = `${Date.now()}-${file.originalname.replace(/[^a-zA-Z0-9.\-_]/g, '_')}`
      cb(null, safeName)
    },
  })
}
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
  speakers: ['name', 'title', 'bio', 'photoURL', 'linkedin', 'github', 'sortOrder', 'published'],
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

// ── Site Config ────────────────────────────────────────────────────────────────

app.get('/api/site-config', async (req, res) => {
  try {
    const items = await prisma.siteConfig.findMany()
    const config = items.reduce((acc, item) => {
      acc[item.key] = item.value
      return acc
    }, {})
    res.json(config)
  } catch (error) {
    console.error(`GET /api/site-config failed:`, error.message)
    res.status(500).json({ error: 'Failed to fetch configs.' })
  }
})

app.post('/api/site-config', authMiddleware, async (req, res) => {
  try {
    const { key, value } = req.body
    if (!key) return res.status(400).json({ error: 'Key is required' })

    const item = await prisma.siteConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
    
    await recordAudit({
      email: req.user.email,
      action: `Updated Site Config`,
      resource: `SiteConfig:${key}`,
      ipAddress: getClientIp(req),
    })
    res.json(item)
  } catch (error) {
    console.error(`POST /api/site-config failed:`, error.message)
    res.status(500).json({ error: 'Failed to save config.' })
  }
})

// ── File upload ────────────────────────────────────────────────────────────────

app.post('/api/upload', authMiddleware, upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }
  
  // If uploaded to Cloudinary, req.file.path is the cloud URL
  // If local, we return the relative /uploads/ path
  const fileUrl = req.file.path && req.file.path.startsWith('http') 
    ? req.file.path 
    : `/uploads/${req.file.filename}`

  res.json({ url: fileUrl })
})

// ── Contact form ───────────────────────────────────────────────────────────────

// Configure nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail', // Standard configuration for Gmail
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
})

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body
  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  try {
    // 1. Save to database
    await prisma.contactMessage.create({
      data: { name, email, message },
    })

    // 2. Send the email
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"${name}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: `[OOSC 4.0 Contact Form] New message from ${name}`,
        text: `You have received a new inquiry from the OOSC 4.0 website.\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
        html: `<p>You have received a new inquiry from the OOSC 4.0 website.</p>
               <p><strong>Name:</strong> ${name}<br>
               <strong>Email:</strong> ${email}</p>
               <p><strong>Message:</strong></p>
               <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">${message.replace(/\n/g, '<br>')}</blockquote>`,
      })
    }

    console.log(`Contact processed from ${name} (${email})`)
    res.json({ success: true, message: 'Contact message received successfully.' })
  } catch (error) {
    console.error('Contact form error:', error)
    res.status(500).json({ error: 'Failed to process contact message.' })
  }
})

// ── Sponsor Application form ───────────────────────────────────────────────────

app.post('/api/sponsor-apply', async (req, res) => {
  const { name, email, organization, message } = req.body
  if (!name || !email || !organization) {
    return res.status(400).json({ error: 'Name, email, and organization are required.' })
  }

  try {
    // Optionally log this into the database (we can reuse ContactMessage or create a new table,
    // but the instruction specifically asked for nodemailer integration, so email is the priority)
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      await transporter.sendMail({
        from: `"${name}" <${process.env.EMAIL_FROM || process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO || process.env.EMAIL_USER,
        replyTo: email,
        subject: `[OOSC 4.0 Sponsor App] New application from ${organization}`,
        text: `You have received a new sponsorship application.\n\nName: ${name}\nEmail: ${email}\nOrganization: ${organization}\n\nMessage/Details:\n${message || 'None provided'}`,
        html: `<p>You have received a new sponsorship application.</p>
               <p><strong>Name:</strong> ${name}<br>
               <strong>Email:</strong> ${email}<br>
               <strong>Organization:</strong> ${organization}</p>
               <p><strong>Additional Details:</strong></p>
               <blockquote style="border-left: 4px solid #ccc; padding-left: 10px;">${(message || 'None provided').replace(/\n/g, '<br>')}</blockquote>`,
      })
    }

    console.log(`Sponsor application processed from ${name} at ${organization}`)
    res.json({ success: true, message: 'Sponsor application received successfully.' })
  } catch (error) {
    console.error('Sponsor form error:', error)
    res.status(500).json({ error: 'Failed to process sponsor application.' })
  }
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

if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
  app.listen(port, () => {
    console.log(`OOSC backend listening on http://localhost:${port}`)
  })
}

export default app
