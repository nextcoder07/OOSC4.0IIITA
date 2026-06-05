# OOSC 4.0 Website

A full-stack web application for managing the Open Source Summer Camp (OOSC) event. Features admin dashboard with CRUD operations for speakers, sponsors, events/schedule, and team members. Built with React + Vite (frontend) and Express.js + Prisma (backend).

## 🌟 Features

- **Admin Dashboard** - Manage speakers, sponsors, events, and team members
- **Email Verification** - Secure admin onboarding with email confirmation
- **Image Upload** - Drag-and-drop image uploads with live preview
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **JWT Authentication** - Secure admin authentication with access/refresh tokens
- **Audit Logging** - Track all admin actions with IP addresses
- **Mobile Friendly** - Slide-out options and responsive modals on small screens

## 📋 Tech Stack

### Frontend
- **React 19.2.6** - UI framework
- **Vite 8.0.12** - Build tool
- **CSS3** - Custom styling with CSS variables

### Backend
- **Express.js** - Web server
- **Prisma 5.22.0** - ORM
- **MySQL (Aiven)** - Database
- **Nodemailer** - Email service
- **bcrypt** - Password hashing
- **JWT** - Authentication
- **Multer** - File uploads

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- MySQL database (or Aiven account)
- Gmail account (for email verification) OR SMTP server

### Installation

1. **Clone the repository**
	```bash
	git clone <repo-url>
	cd OOSCWEB
	```

2. **Install dependencies**
	```bash
	npm install
	cd backend && npm install && cd ..
	```

3. **Setup Database**
	```bash
	cd backend
	npx prisma migrate dev
	```

4. **Configure Environment Variables**

	**IMPORTANT:** Create a `.env` file in the `backend` folder (NOT in the root):
   
	```bash
	backend/.env
	```

You can also copy the provided example file `backend/.env.example` to `backend/.env`.

	Add the following variables:

	```env
	# Database (Get from Aiven or your MySQL provider)
	DATABASE_URL="mysql://user:password@host:port/dbname?ssl-mode=REQUIRED"

	# Email Configuration (Use Gmail app password)
	EMAIL_USER=your-gmail@gmail.com
	EMAIL_PASS=your-16-char-app-password
	EMAIL_FROM=your-gmail@gmail.com

	# Or use custom SMTP (instead of Gmail)
	SMTP_HOST=smtp.yourserver.com
	SMTP_PORT=587
	SMTP_USER=your-email@company.com
	SMTP_PASS=your-password
	SMTP_SECURE=false

	# JWT Secrets (Generate strong random strings)
	JWT_SECRET=your-super-secret-jwt-key-change-this
	JWT_REFRESH_SECRET=your-refresh-secret-key-change-this

	# Admin Configuration
	ADMIN_USERNAME=admin@oosc.iiita.ac.in
	ADMIN_PASSWORD=super-secure-password
	```

	**⚠️ SECURITY WARNING:**
	- Never commit `.env` to git (it's in `.gitignore`)
	- Never share `.env` credentials
	- Generate strong random secrets for JWT
	- Use Gmail app passwords, not your main password

5. **Admin Access Setup**

	Admin authentication is now based solely on `ADMIN_USERNAME` and `ADMIN_PASSWORD` in your `.env` file.
	There is no longer any `backend/allowedAdmins.json` whitelist dependency.

## 📦 Running the Application

### Development Mode

**Terminal 1 - Frontend (React + Vite)**
```bash
npm run dev
```
Frontend runs on: http://localhost:5173

**Terminal 2 - Backend (Express.js)**
```bash
cd backend
node server.js
```
Backend runs on: http://localhost:5000

### Production Build

```bash
npm run build
```

Creates optimized build in `dist/` folder.

## 🔐 Admin Setup & Login

### First-Time Admin Onboarding

1. Click **"First time? Request Verification Email"** on the login page
2. Enter your **whitelisted email** and **create a strong password**
	- Password must have: 8+ chars, UPPERCASE, lowercase, number, special character
3. Click **"Send Verification Email"**
4. Check your inbox for verification email
5. Click **"Verify Email & Activate Account"** link
6. You're verified! Now you can **login** with your email + password

### Admin Features

Once logged in, you can:

- **Speakers** - Add/edit/delete speaker profiles with photos
- **Sponsors** - Manage sponsors by tier (Title, Platinum, Gold, Silver, Community, Media)
- **Schedule** - Add/edit/delete timeline events by day
- **Team** - Manage team member profiles

All changes are saved to database immediately.

## 🗄️ Database Schema

### Key Models

- **AdminUser** - Admin accounts with email, password, verification status, roles
- **Speaker** - Speaker profiles with bio, photo, sort order
- **Sponsor** - Sponsor info with logo, category, website
- **Event** - Timeline events with date, time, description
- **TeamMember** - Team profiles with role, contact info
- **AuditLog** - Logs all admin actions for security

See `backend/prisma/schema.prisma` for full schema.

## 📧 Email Setup

### Option 1: Gmail (Recommended for Testing)

1. Go to [Google Account Security](https://myaccount.google.com/apppasswords)
2. Select "Mail" and "Windows"
3. Copy the 16-character app password
4. Add to `backend/.env`:
	```env
	EMAIL_USER=your-gmail@gmail.com
	EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
	```

### Option 2: Custom SMTP

Add these to `backend/.env`:
```env
SMTP_HOST=smtp.company.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

## 🐛 Troubleshooting

**502 Bad Gateway Error**
- ✅ Make sure `.env` has valid `EMAIL_USER` and `EMAIL_PASS`
- ✅ Check backend console for errors: `cd backend && node server.js`

**Can't login - "Forbidden" error**
- ✅ Confirm `ADMIN_USERNAME` and `ADMIN_PASSWORD` are set correctly in `.env`
- ✅ Ensure the backend is restarted after `.env` changes

**Email not received**
- ✅ Check spam/junk folder
- ✅ Check backend console for verification link
- ✅ Verify `EMAIL_USER` and `EMAIL_PASS` are correct

**Database connection error**
- ✅ Check `DATABASE_URL` in `backend/.env`
- ✅ Ensure MySQL server is running
- ✅ For Aiven: add `?ssl-mode=REQUIRED` to connection string

## 📁 Project Structure

```
OOSCWEB/
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styles (including modal)
│   ├── main.jsx         # Entry point
│   ├── data.js          # Sample data
│   └── components/      # React components
│       ├── Footer.jsx
│       ├── FAQ.jsx
│       ├── ImageUploader.jsx
│       └── Registration.jsx
├── backend/
│   ├── server.js        # Express server
│   ├── .env             # Environment variables (KEEP SECRET!)
│   ├── uploads/         # Uploaded images
│   ├── prisma/
│   │   └── schema.prisma
│   └── package.json
├── public/              # Static assets
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 🔗 API Endpoints

### Auth Routes
- `POST /admin/login` - Login using `ADMIN_USERNAME` and `ADMIN_PASSWORD` from environment variables
- `POST /admin/logout` - Logout
- `POST /admin/refresh` - Refresh JWT token
- `GET /admin/me` - Get current admin info

> Admin access is only available through the direct `/admin/login` path. No public navigation exposes admin functionality.

### CRUD Routes (Protected)
- `GET /api/speakers` - List all speakers
- `POST /api/speakers` - Create speaker
- `PUT /api/speakers/:id` - Update speaker
- `DELETE /api/speakers/:id` - Delete speaker

Same pattern for: `/api/sponsors`, `/api/events`, `/api/team`

### Image Upload
- `POST /api/upload` - Upload image, returns URL

## 📝 License

Private project. All rights reserved.

## 👥 Support

For issues, contact the OOSC development team.
