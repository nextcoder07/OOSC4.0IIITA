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
const IS_DEV = process.env.NODE_ENV !== 'production'
const COOKIE_SECURE = !IS_DEV
const COOKIE_SAME_SITE = IS_DEV ? 'none' : 'strict'
const JWT_SECRET = process.env.JWT_SECRET ?? 'oosc-secret'
const ACCESS_EXPIRES = '24h'
const ADMIN_PASSWORD_HASH = process.env.ADMIN_PASSWORD_HASH ?? ''
const ADMIN_USERNAME = process.env.ADMIN_USERNAME ?? ''
const ADMIN_ROLE = process.env.ADMIN_ROLE ?? 'ADMIN'

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
    origin: IS_DEV
      ? true
      : CLIENT_ORIGIN,
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
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (allowed.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed.'))
    }
  },
})

// ── Rate limiting ─────────────────────────────────────────────────────────────

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later.' },
})

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_DEV ? 1000 : 100,
  standardHeaders: true,
  legacyHeaders: false,
})

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_DEV ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many contact requests, please try again later.' },
})

const registrationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: IS_DEV ? 200 : 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many registration requests, please try again later.' },
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

// ── Input sanitization ─────────────────────────────────────────────────────────

const allowedFields = {
  speakers: ['name', 'title', 'bio', 'photoURL', 'sortOrder', 'published', 'organization', 'linkedin', 'github', 'twitter', 'website', 'email'],
  sponsors: ['name', 'logoURL', 'category', 'website', 'description', 'sortOrder', 'published'],
  events: ['title', 'description', 'date', 'time', 'type', 'speaker', 'venue', 'startTime', 'endTime', 'track', 'sortOrder', 'published'],
  team: ['name', 'role', 'contact', 'photoURL', 'department', 'linkedin', 'github', 'email', 'sortOrder', 'published'],
}

const parseBoolean = (value) => {
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    return ['true', '1', 'yes', 'on'].includes(normalized)
  }
  return Boolean(value)
}

const isValidEmail = (value) =>
  typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())

const parseIdParam = (value, res) => {
  const id = Number(value)
  if (!Number.isInteger(id) || id <= 0) {
    res.status(400).json({ error: 'Invalid id parameter.' })
    return null
  }
  return id
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
  if (clean.published !== undefined) clean.published = parseBoolean(clean.published)
  return clean
}

const createAccessToken = (admin) =>
  jwt.sign({ email: admin.email, username: admin.username, role: admin.role }, JWT_SECRET, { expiresIn: ACCESS_EXPIRES })

const setAuthCookie = (res, token) => {
  res.cookie('ooscAccessToken', token, {
    httpOnly: true,
    secure: COOKIE_SECURE,
    sameSite: COOKIE_SAME_SITE,
    maxAge: 24 * 60 * 60 * 1000,
  })
}

const clearAuthCookie = (res) => {
  res.clearCookie('ooscAccessToken', { httpOnly: true, secure: COOKIE_SECURE, sameSite: COOKIE_SAME_SITE })
}

const revokedTokensFile = path.join(__dirname, 'revokedTokens.json')
const loadRevokedTokens = () => {
  try {
    const json = fs.readFileSync(revokedTokensFile, 'utf-8')
    const list = JSON.parse(json)
    return Array.isArray(list) ? list.filter((token) => typeof token === 'string') : []
  } catch {
    return []
  }
}

const persistRevokedTokens = (tokens) => {
  try {
    fs.writeFileSync(revokedTokensFile, JSON.stringify([...tokens], null, 2), 'utf-8')
  } catch (error) {
    console.error('Unable to persist revoked tokens:', error.message)
  }
}

const tokenBlacklist = new Set(loadRevokedTokens())
setInterval(() => {
  tokenBlacklist.forEach((token) => {
    try {
      jwt.verify(token, JWT_SECRET)
    } catch {
      tokenBlacklist.delete(token)
    }
  })
  persistRevokedTokens(tokenBlacklist)
}, 60 * 60 * 1000)

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
    return res.status(401).json({ error: 'Invalid token' })
  }
}

// ── Apply rate limiters & static files ─────────────────────────────────────────

app.use('/api', generalLimiter)
app.use('/admin/login', loginLimiter)
app.use('/uploads', express.static(uploadDir))

// ── Legacy CSRF token endpoint for frontend compatibility ───────────────────────

app.get('/api/csrf-token', (req, res) => {
  res.json({ csrfToken: '' })
})

// ── Auth routes ────────────────────────────────────────────────────────────────

app.get('/admin/me', authMiddleware, async (req, res) => {
  res.json({ email: req.user.email, username: req.user.username, role: req.user.role })
})

app.post('/admin/login', async (req, res) => {
  const input = String(req.body.email || req.body.username || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  if (!input || !password) {
    return res.status(400).json({ error: 'Email or username and password are required.' })
  }

  const allowedSet = new Set()
  allowedAdmins
    .filter(Boolean)
    .forEach((item) => {
      const value = String(item).trim().toLowerCase()
      if (!value) return
      allowedSet.add(value)
      if (value.includes('@')) {
        allowedSet.add(value.split('@')[0])
      }
    })

  if (ADMIN_USERNAME) {
    allowedSet.add(ADMIN_USERNAME.toLowerCase())
  }

  if (!ADMIN_PASSWORD_HASH) {
    console.error('ADMIN_PASSWORD_HASH is not configured. Admin login is disabled.')
    return res.status(500).json({ error: 'Admin authentication is not configured.' })
  }

  const validUser = allowedSet.size > 0 && allowedSet.has(input)
  const validPass = await bcrypt.compare(password, ADMIN_PASSWORD_HASH)

  if (!validUser || !validPass) {
    await recordAudit({
      email: input,
      action: 'Failed login attempt',
      resource: 'AdminAuth',
      ipAddress: getClientIp(req),
    })
    return res.status(401).json({ error: 'Invalid email or password.' })
  }

  const matchedAdmin = allowedAdmins.find((item) => {
    if (!item || typeof item !== 'string') return false
    const candidate = item.toLowerCase()
    return candidate === input || candidate.split('@')[0] === input
  })
  const adminUsername = matchedAdmin || ADMIN_USERNAME || input.split('@')[0]
  const admin = { email: input, username: adminUsername, role: ADMIN_ROLE }
  const token = createAccessToken(admin)
  setAuthCookie(res, token)

  await recordAudit({
    email: admin.email,
    action: 'Logged in',
    resource: 'AdminAuth',
    ipAddress: getClientIp(req),
  })

  res.json({ success: true, email: admin.email, username: admin.username, role: admin.role })
})

app.post('/admin/logout', authMiddleware, async (req, res) => {
  if (req.token) {
    tokenBlacklist.add(req.token)
    persistRevokedTokens(tokenBlacklist)
  }
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
    try {
      const includeDraft = req.query.includeDraft === '1'
      const where = hasPublished && !includeDraft ? { published: true } : undefined
      const opts = { orderBy: orderFields.map((field) => ({ [field]: 'asc' })) }
      if (where) opts.where = where
      const items = await model.findMany(opts)
      res.json(items)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  const fields = allowedFields[name] || []

  app.post(`/api/${name}`, authMiddleware, async (req, res) => {
    try {
      const data = sanitizeBody(req.body, fields)
      const item = await model.create({ data })
      await recordAudit({
        email: req.user.username,
        action: `Created ${name}`,
        resource: `${name}:${item.id}`,
        ipAddress: getClientIp(req),
      })
      res.status(201).json(item)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  app.put(`/api/${name}/:id`, authMiddleware, async (req, res) => {
    try {
      const id = parseIdParam(req.params.id, res)
      if (id === null) return
      const data = sanitizeBody(req.body, fields)
      const item = await model.update({ where: { id }, data })
      await recordAudit({
        email: req.user.username,
        action: `Updated ${name}`,
        resource: `${name}:${id}`,
        ipAddress: getClientIp(req),
      })
      res.json(item)
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })

  app.delete(`/api/${name}/:id`, authMiddleware, async (req, res) => {
    try {
      const id = parseIdParam(req.params.id, res)
      if (id === null) return
      await model.delete({ where: { id } })
      await recordAudit({
        email: req.user.username,
        action: `Deleted ${name}`,
        resource: `${name}:${id}`,
        ipAddress: getClientIp(req),
      })
      res.status(204).send()
    } catch (error) {
      res.status(500).json({ error: error.message })
    }
  })
}

// Register CRUD for models the frontend actually uses
createCrudRoutes('speakers', prisma.speaker)
createCrudRoutes('sponsors', prisma.sponsor)
createCrudRoutes('events', prisma.event)
createCrudRoutes('team', prisma.teamMember)

// ── Settings API ───────────────────────────────────────────────────────────────

app.get('/api/settings', async (req, res) => {
  try {
    const settings = await prisma.setting.findMany()
    const settingsMap = {}
    settings.forEach((s) => {
      settingsMap[s.key] = s.value
    })
    res.json(settingsMap)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.post('/api/settings', authMiddleware, async (req, res) => {
  try {
    const { settings } = req.body
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ error: 'Settings object is required' })
    }

    const updates = Object.entries(settings).map(([key, value]) => {
      return prisma.setting.upsert({
        where: { key },
        update: { value: String(value) },
        create: { key, value: String(value) },
      })
    })

    await prisma.$transaction(updates)
    await recordAudit({
      email: req.user.username,
      action: 'Updated system settings',
      resource: 'Settings',
      ipAddress: getClientIp(req),
    })

    res.json({ success: true })
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── Contact messages API ───────────────────────────────────────────────────────

app.post('/api/contact', contactLimiter, async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim()
  const message = String(req.body.message || '').trim()

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' })
  }

  try {
    await prisma.contactMessage.create({
      data: { name, email, message },
    })
    res.json({ success: true, message: 'Message sent successfully.' })
  } catch (error) {
    console.error('Contact message error', error)
    res.status(500).json({ error: 'Unable to save message.' })
  }
})

app.get('/api/messages', authMiddleware, async (req, res) => {
  try {
    const messages = await prisma.contactMessage.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(messages)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.patch('/api/messages/:id/read', authMiddleware, async (req, res) => {
  try {
    const id = parseIdParam(req.params.id, res)
    if (id === null) return
    const msg = await prisma.contactMessage.update({
      where: { id },
      data: { read: true },
    })
    res.json(msg)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/messages/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseIdParam(req.params.id, res)
    if (id === null) return
    await prisma.contactMessage.delete({ where: { id } })
    await recordAudit({
      email: req.user.username,
      action: 'Deleted contact message',
      resource: `Message:${id}`,
      ipAddress: getClientIp(req),
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── Registrations / Leads API ──────────────────────────────────────────────────

app.get('/api/registrations', authMiddleware, async (req, res) => {
  try {
    const leads = await prisma.lead.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(leads)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

app.delete('/api/registrations/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseIdParam(req.params.id, res)
    if (id === null) return
    await prisma.lead.delete({ where: { id } })
    await recordAudit({
      email: req.user.username,
      action: 'Deleted registration interest',
      resource: `Registration:${id}`,
      ipAddress: getClientIp(req),
    })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── Media Library API & Uploads ────────────────────────────────────────────────

app.get('/api/media', authMiddleware, async (req, res) => {
  try {
    const media = await prisma.mediaAsset.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(media)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// Upload file to server and create media asset record
app.post('/api/upload', authMiddleware, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded.' })
  }

  const fileUrl = `/uploads/${req.file.filename}`
  const category = String(req.body.category || req.query.category || 'General').trim() || 'General'
  const filepath = path.join(uploadDir, req.file.filename)

  try {
    const asset = await prisma.mediaAsset.create({
      data: {
        url: fileUrl,
        filename: req.file.originalname,
        category,
      },
    })

    await recordAudit({
      email: req.user.username,
      action: `Uploaded file: ${req.file.originalname}`,
      resource: `MediaAsset:${asset.id}`,
      ipAddress: getClientIp(req),
    })

    return res.json({ url: fileUrl, asset })
  } catch (error) {
    console.error('Upload metadata save failed:', error)
    if (fs.existsSync(filepath)) {
      try {
        fs.unlinkSync(filepath)
      } catch (unlinkError) {
        console.error('Unable to delete orphaned upload file:', unlinkError)
      }
    }
    return res.status(500).json({ error: 'Unable to save upload metadata.' })
  }
})

// Create media asset by external URL (no file upload)
app.post('/api/media', authMiddleware, async (req, res) => {
  try {
    const { url, filename, category } = req.body
    if (!url) return res.status(400).json({ error: 'URL is required' })

    const name = filename || path.basename(url)
    const asset = await prisma.mediaAsset.create({
      data: { url: String(url), filename: String(name), category: category || 'General' },
    })

    await recordAudit({
      email: req.user.username,
      action: `Added external media: ${name}`,
      resource: `MediaAsset:${asset.id}`,
      ipAddress: getClientIp(req),
    })

    res.json(asset)
  } catch (error) {
    console.error('Creating media asset failed', error)
    res.status(500).json({ error: 'Unable to create media asset.' })
  }
})

app.delete('/api/media/:id', authMiddleware, async (req, res) => {
  try {
    const id = parseIdParam(req.params.id, res)
    if (id === null) return

    const asset = await prisma.mediaAsset.findUnique({ where: { id } })
    if (!asset) {
      return res.status(404).json({ error: 'Media asset not found.' })
    }

    if (asset.url.startsWith('/uploads/')) {
      const filename = path.basename(asset.url)
      const filepath = path.join(uploadDir, filename)
      if (fs.existsSync(filepath)) {
        try {
          fs.unlinkSync(filepath)
        } catch (unlinkError) {
          console.error('Unable to delete media file:', unlinkError)
        }
      }
    }

    await prisma.mediaAsset.delete({ where: { id } })

    await recordAudit({
      email: req.user.username,
      action: `Deleted file: ${asset.filename}`,
      resource: `MediaAsset:${id}`,
      ipAddress: getClientIp(req),
    })

    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── Audit logs API ─────────────────────────────────────────────────────────────

app.get('/api/audit-logs', authMiddleware, async (req, res) => {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    })
    res.json(logs)
  } catch (error) {
    res.status(500).json({ error: error.message })
  }
})

// ── Registration Form Submission ───────────────────────────────────────────────

app.post('/api/registration', registrationLimiter, async (req, res) => {
  const name = String(req.body.name || '').trim()
  const email = String(req.body.email || '').trim()
  const affiliation = String(req.body.affiliation || '').trim()
  const message = String(req.body.message || '').trim()

  if (!name || !email) {
    return res.status(400).json({ error: 'Name and email are required.' })
  }

  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'A valid email address is required.' })
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
