import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import csurf from 'csurf'
import rateLimit from 'express-rate-limit'
import nodemailer from 'nodemailer'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
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
const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000
const RESET_EXPIRY_MS = 30 * 60 * 1000
const LOCKOUT_MINUTES = 15
const MAX_FAILED_ATTEMPTS = 5

const getAllowedAdmins = () => {
  try {
    const filePath = path.join(__dirname, 'allowedAdmins.json')
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch (error) {
    console.error('Error reading allowedAdmins.json', error)
    return []
  }
}

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
    { email: admin.email, role: admin.role },
    JWT_SECRET,
    { expiresIn: ACCESS_EXPIRES },
  )
  const refreshToken = jwt.sign(
    { email: admin.email },
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

const validatePassword = (password) => {
  return typeof password === 'string' &&
    password.length >= 12 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /[0-9]/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
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

const superAdminMiddleware = async (req, res, next) => {
  if (!req.user?.role || req.user.role !== 'SUPER_ADMIN') {
    return res.status(403).json({ error: 'Forbidden' })
  }
  next()
}

app.use('/api', generalLimiter)
app.use('/admin/login', loginLimiter)
app.use('/admin/request-verification', loginLimiter)
app.use('/admin/reset-request', loginLimiter)

app.use('/uploads', express.static(uploadDir))

app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.json({ csrfToken: req.csrfToken() })
})

app.get('/admin/me', authMiddleware, async (req, res) => {
  res.json({ email: req.user.email, role: req.user.role })
})

app.post('/admin/request-verification', csrfProtection, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '').trim()
  
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' })
  }

  const whitelist = getAllowedAdmins()
  if (!whitelist.includes(email)) {
    return res.status(403).json({ error: 'Access Denied. You are not authorized to access the OOSC Admin Panel.' })
  }

  // Validate password strength
  if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
    return res.status(400).json({ error: 'Password must be 8+ chars with uppercase, lowercase, number, and special character.' })
  }

  try {
    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS)
    const role = email === process.env.SUPER_ADMIN_EMAIL ? 'SUPER_ADMIN' : 'ADMIN'
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.adminUser.upsert({
      where: { email },
      update: {
        passwordHash,
        verificationToken: token,
        verificationTokenExpires: expiresAt,
        isVerified: false,
        role,
        failedLoginAttempts: 0,
      },
      create: {
        email,
        passwordHash,
        role,
        verificationToken: token,
        verificationTokenExpires: expiresAt,
        isVerified: false,
        failedLoginAttempts: 0,
      },
    })

    const clientUrl = process.env.CLIENT_URL || CLIENT_ORIGIN
    const verifyLink = `${clientUrl}/admin/verify?token=${token}`
    
    try {
      await sendAdminEmail({
        to: email,
        subject: 'OOSC 4.0 Admin Account Verification',
        html: `<h2>Welcome to OOSC 4.0 Admin Panel</h2>
<p>Your account has been created successfully. Click the link below to verify your email and activate your account:</p>
<p><a href="${verifyLink}" style="background:var(--color-cyan);color:#000;padding:12px 24px;border-radius:8px;text-decoration:none;display:inline-block;">Verify Email & Activate Account</a></p>
<p>Link expires in 24 hours.</p>
<p>If you didn't request this, please ignore this email.</p>`,
        text: `Verify your admin account at ${verifyLink}`,
      })
    } catch (emailError) {
      console.error('Email sending failed:', emailError.message)
      // Still return success but warn user
      return res.json({ 
        success: true, 
        message: 'Account created, but email delivery failed. Please contact support. Verification link: ' + verifyLink 
      })
    }

    await recordAudit({
      email,
      action: 'Requested verification with password',
      resource: 'AdminUser',
      ipAddress: getClientIp(req),
    })

    res.json({ success: true, message: 'Verification email sent! Check your inbox to activate your account.' })
  } catch (error) {
    console.error('Request verification error:', error)
    res.status(500).json({ error: 'An error occurred. Please try again.' })
  }
})

app.get('/admin/verify', async (req, res) => {
  const token = String(req.query.token || '')
  if (!token) {
    return res.status(400).json({ error: 'Verification token is required.' })
  }

  const admin = await prisma.adminUser.findFirst({
    where: { verificationToken: token, verificationTokenExpires: { gte: new Date() } },
  })
  if (!admin) {
    return res.status(404).json({ error: 'Verification token is invalid or has expired.' })
  }

  // Mark as verified when email confirmation link is clicked
  await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
    },
  })

  await recordAudit({
    email: admin.email,
    action: 'Verified email',
    resource: 'AdminUser',
    ipAddress: getClientIp({ headers: { 'x-forwarded-for': req.headers['x-forwarded-for'] || req.socket.remoteAddress } }),
  })

  res.json({ success: true, email: admin.email, role: admin.role, message: 'Email verified! You can now login with your email and password.' })
})

app.post('/admin/verify-password', csrfProtection, async (req, res) => {
  const token = String(req.body.token || '')
  const password = String(req.body.password || '')

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.',
    })
  }

  const admin = await prisma.adminUser.findFirst({
    where: { verificationToken: token, verificationTokenExpires: { gte: new Date() } },
  })
  if (!admin) {
    return res.status(404).json({ error: 'Verification token is invalid or has expired.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const role = admin.role || 'ADMIN'

  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      isVerified: true,
      verificationToken: null,
      verificationTokenExpires: null,
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
      role,
    },
  })

  await recordAudit({
    email: updated.email,
    action: 'Created password and verified account',
    resource: 'AdminUser',
    ipAddress: getClientIp(req),
  })

  const { accessToken, refreshToken } = createTokens(updated)
  setAuthCookies(res, accessToken, refreshToken)
  res.json({ success: true, role: updated.role, email: updated.email })
})

app.post('/admin/login', csrfProtection, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const password = String(req.body.password || '')

  const whitelist = getAllowedAdmins()
  if (!email || !whitelist.includes(email)) {
    return res.status(403).json({ error: 'Access Denied. Your email is not whitelisted on this platform.' })
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin || !admin.passwordHash || !admin.isVerified) {
    return res.status(401).json({ error: 'Invalid credentials or account not verified.' })
  }

  if (admin.lockedUntil && admin.lockedUntil > new Date()) {
    return res.status(429).json({ error: 'Account locked due to too many failed login attempts. Try again later.' })
  }

  const isValid = await bcrypt.compare(password, admin.passwordHash)
  if (!isValid) {
    const failedAttempts = (admin.failedLoginAttempts || 0) + 1
    const updateData = { failedLoginAttempts: failedAttempts }
    if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
      updateData.lockedUntil = new Date(Date.now() + LOCKOUT_MINUTES * 60 * 1000)
    }
    await prisma.adminUser.update({ where: { email }, data: updateData })
    await recordAudit({
      email,
      action: 'Failed login attempt',
      resource: 'AdminUser',
      ipAddress: getClientIp(req),
    })
    return res.status(401).json({ error: 'Invalid credentials.' })
  }

  await prisma.adminUser.update({
    where: { email },
    data: { failedLoginAttempts: 0, lockedUntil: null, lastLogin: new Date() },
  })

  const { accessToken, refreshToken } = createTokens(admin)
  setAuthCookies(res, accessToken, refreshToken)
  await recordAudit({
    email,
    action: 'Logged in',
    resource: 'AdminUser',
    ipAddress: getClientIp(req),
  })

  res.json({ success: true, role: admin.role, email: admin.email })
})

app.post('/admin/logout', authMiddleware, csrfProtection, async (req, res) => {
  clearAuthCookies(res)
  await recordAudit({
    email: req.user.email,
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
    const admin = await prisma.adminUser.findUnique({ where: { email: payload.email } })
    if (!admin || !admin.isVerified) {
      return res.status(401).json({ error: 'Invalid refresh token.' })
    }

    const { accessToken } = createTokens(admin)
    setAuthCookies(res, accessToken, refreshToken)
    res.json({ success: true })
  } catch (error) {
    clearAuthCookies(res)
    return res.status(401).json({ error: 'Invalid refresh token.' })
  }
})

app.post('/admin/reset-request', csrfProtection, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()

  const whitelist = getAllowedAdmins()

  if (!email || !whitelist.includes(email)) {
    return res.status(200).json({ success: true, message: 'If this email is approved, a reset link will be sent.' })
  }

  const admin = await prisma.adminUser.findUnique({ where: { email } })
  if (!admin || !admin.isVerified) {
    return res.status(200).json({ success: true, message: 'If this email is approved, a reset link will be sent.' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + RESET_EXPIRY_MS)
  await prisma.adminUser.update({
    where: { email },
    data: {
      resetToken: token,
      resetTokenExpires: expiresAt,
    },
  })

  const clientUrl = process.env.CLIENT_URL || CLIENT_ORIGIN
  const resetLink = `${clientUrl}/admin/reset?token=${token}`
  await sendAdminEmail({
    to: email,
    subject: 'OOSC 4.0 Password Reset',
    text: `Reset your admin password at ${resetLink}`,
    html: `<p>Click below to reset your password:</p><p><a href="${resetLink}">Reset Password</a></p><p>The link expires in 30 minutes.</p>`,
  })

  await recordAudit({
    email,
    action: 'Requested password reset',
    resource: 'AdminUser',
    ipAddress: getClientIp(req),
  })

  res.json({ success: true, message: 'If this email is approved, a reset link will be sent.' })
})

app.post('/admin/reset-password', csrfProtection, async (req, res) => {
  const token = String(req.body.token || '')
  const password = String(req.body.password || '')

  if (!token || !password) {
    return res.status(400).json({ error: 'Token and password are required.' })
  }
  if (!validatePassword(password)) {
    return res.status(400).json({
      error: 'Password must be at least 12 characters long and include uppercase, lowercase, number, and special character.',
    })
  }

  const admin = await prisma.adminUser.findFirst({
    where: { resetToken: token, resetTokenExpires: { gte: new Date() } },
  })
  if (!admin) {
    return res.status(404).json({ error: 'Reset token is invalid or has expired.' })
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const updated = await prisma.adminUser.update({
    where: { id: admin.id },
    data: {
      passwordHash,
      resetToken: null,
      resetTokenExpires: null,
      isVerified: true,
      lastLogin: new Date(),
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
  })

  await recordAudit({
    email: updated.email,
    action: 'Reset password',
    resource: 'AdminUser',
    ipAddress: getClientIp(req),
  })

  const { accessToken, refreshToken } = createTokens(updated)
  setAuthCookies(res, accessToken, refreshToken)
  res.json({ success: true, role: updated.role, email: updated.email })
})

app.get('/admin/users', authMiddleware, superAdminMiddleware, async (req, res) => {
  const admins = await prisma.adminUser.findMany({
    select: {
      id: true,
      email: true,
      role: true,
      isVerified: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  })
  res.json(admins)
})

app.post('/admin/users', authMiddleware, superAdminMiddleware, csrfProtection, async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase()
  const role = String(req.body.role || 'ADMIN').toUpperCase()
  const whitelist = getAllowedAdmins()
  if (!email || !whitelist.includes(email)) {
    return res.status(403).json({ error: 'Email is not authorized to be an admin.' })
  }
  if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' })
  }

  const token = crypto.randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS)
  const admin = await prisma.adminUser.upsert({
    where: { email },
    update: {
      role,
      verificationToken: token,
      verificationTokenExpires: expiresAt,
      isVerified: false,
      failedLoginAttempts: 0,
      lockedUntil: null,
    },
    create: {
      email,
      role,
      verificationToken: token,
      verificationTokenExpires: expiresAt,
      isVerified: false,
      failedLoginAttempts: 0,
    },
  })

  const clientUrl = process.env.CLIENT_URL || CLIENT_ORIGIN
  const verifyLink = `${clientUrl}/admin/verify?token=${token}`

  try {
    await sendAdminEmail({
      to: email,
      subject: 'OOSC 4.0 Admin Verification',
      text: `Verify your admin account at ${verifyLink}`,
      html: `
        <p>Click the link below to verify your admin account:</p>
        <p><a href="${verifyLink}">Verify Admin Account</a></p>
        <p>The link expires in 24 hours.</p>
      `,
    })

    console.log(`Verification email sent to ${email}`)
  } catch (err) {
    console.error('Email sending failed:', err)

    // During local development you can still access the link
    console.log('====================================')
    console.log('VERIFICATION LINK')
    console.log(verifyLink)
    console.log('====================================')
  }

  await recordAudit({
    email: req.user.email,
    action: `Invited new admin ${email}`,
    resource: 'AdminUser',
    ipAddress: getClientIp(req),
  })

  res.status(201).json({ success: true, admin: { email: admin.email, role: admin.role } })
})

app.patch('/admin/users/:id/role', authMiddleware, superAdminMiddleware, csrfProtection, async (req, res) => {
  const id = Number(req.params.id)
  const role = String(req.body.role || '').toUpperCase()
  if (!['ADMIN', 'SUPER_ADMIN', 'CONTENT_MANAGER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role.' })
  }

  const admin = await prisma.adminUser.update({
    where: { id },
    data: { role },
  })

  await recordAudit({
    email: req.user.email,
    action: `Updated role to ${role}`,
    resource: `AdminUser:${id}`,
    ipAddress: getClientIp(req),
  })

  res.json(admin)
})

app.delete('/admin/users/:id', authMiddleware, superAdminMiddleware, csrfProtection, async (req, res) => {
  const id = Number(req.params.id)
  await prisma.adminUser.delete({ where: { id } })
  await recordAudit({
    email: req.user.email,
    action: `Removed admin ${id}`,
    resource: `AdminUser:${id}`,
    ipAddress: getClientIp(req),
  })
  res.status(204).send()
})

app.get('/admin/audit-logs', authMiddleware, superAdminMiddleware, async (req, res) => {
  const logs = await prisma.auditLog.findMany({ orderBy: { createdAt: 'desc' }, take: 200 })
  res.json(logs)
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
      email: req.user.email,
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
      email: req.user.email,
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
      email: req.user.email,
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
    email: req.user.email,
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
    email: req.user.email,
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

app.listen(port, () => {
  console.log(`OOSC backend listening on http://localhost:${port}`)
})
