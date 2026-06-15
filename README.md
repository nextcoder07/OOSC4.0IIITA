# OOSC 4.0 — Open Source Systems Conference

> **Full-stack conference management platform for OOSC 4.0 at IIIT Allahabad**
> Built with React + Vite · Express.js + Prisma · MySQL (Aiven) · Cloudinary

---

## ✨ Features

| Area | Description |
|------|-------------|
| **Multi-Page SPA** | React Router–driven architecture with 8 dedicated page components |
| **Admin Dashboard** | Authenticated CRUD for speakers, sponsors, events & team members |
| **Drag & Drop** | Reorder cards (speakers, sponsors, schedule, team) via drag‑and‑drop |
| **Cloud Image Storage** | Cloudinary-backed image uploads with drag‑and‑drop preview |
| **JWT Auth** | Access + refresh token flow with secure HTTP‑only cookies |
| **Contact Form** | Server‑side email delivery via Nodemailer |
| **Responsive Design** | Mobile hamburger menu, adaptive grids, glassmorphism UI |
| **Hackathon Portal** | Dedicated page with tracks, prizes, rules, dates & registration CTA |

---

## 📋 Tech Stack

### Frontend
- **React 19** — UI framework
- **React Router DOM** — Client-side routing
- **Vite 8** — Build tool & dev server
- **Vanilla CSS** — Custom design system with CSS variables

### Backend
- **Express.js** — REST API server
- **Prisma 5** — Type-safe ORM
- **MySQL (Aiven)** — Cloud-hosted relational database
- **Cloudinary** — Image storage & CDN
- **Nodemailer** — Email delivery
- **bcrypt + JWT** — Authentication & password hashing
- **Helmet + CORS + Rate Limiting** — Security middleware

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 18+** and npm
- MySQL database ([Aiven](https://aiven.io) free tier works)
- [Cloudinary](https://cloudinary.com) account (free tier)
- Gmail account or SMTP server (for contact emails)

### 1. Clone & Install

```bash
git clone https://github.com/0xshellghost/OOSC4.0IIITA.git
cd OOSC4.0IIITA

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
cd ..
```

### 2. Configure Environment

Create `backend/.env`:

```env
# Database (Aiven MySQL)
DATABASE_URL="mysql://user:password@host:port/dbname?ssl-mode=REQUIRED"

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# JWT Secrets (use strong random strings)
JWT_SECRET=your-super-secret-jwt-key
JWT_REFRESH_SECRET=your-refresh-secret-key

# Admin Credentials
ADMIN_USERNAME=admin@oosc.iiita.ac.in
ADMIN_PASSWORD=your-secure-password

# Email (Gmail app password or custom SMTP)
EMAIL_USER=your-gmail@gmail.com
EMAIL_PASS=xxxx-xxxx-xxxx-xxxx
EMAIL_FROM=your-gmail@gmail.com
```

> ⚠️ **Never commit `.env` to git.** It is already in `.gitignore`.

### 3. Setup Database

```bash
cd backend
npx prisma migrate dev
cd ..
```

### 4. Run Locally

**Terminal 1 — Backend:**
```bash
cd backend
npm start
```
→ API server starts on **http://localhost:4000**

**Terminal 2 — Frontend:**
```bash
cd frontend
npm run dev
```
→ Dev server starts on **http://localhost:5173**

Open **http://localhost:5173** in your browser.

### 5. Production Build

```bash
cd frontend
npm run build
```
Creates optimized output in `frontend/dist/`.

---

## 🗂️ Project Structure

```
OOSC4.0IIITA/
├── frontend/
│   └── src/
│       ├── App.jsx                # Root component — layout, state, routes
│       ├── App.css                # Global design system & styles
│       ├── main.jsx               # Entry point with BrowserRouter
│       ├── data.js                # Static fallback data
│       ├── pages/                 # ← Page components (one per route)
│       │   ├── HomePage.jsx       #   /
│       │   ├── HackathonPage.jsx  #   /hackathon
│       │   ├── SchedulePage.jsx   #   /schedule
│       │   ├── SpeakersPage.jsx   #   /speakers
│       │   ├── SponsorsPage.jsx   #   /sponsors
│       │   ├── TeamPage.jsx       #   /team
│       │   ├── ContactPage.jsx    #   /contact
│       │   └── AdminLoginPage.jsx #   /admin
│       └── components/            # Shared / reusable components
│           ├── Footer.jsx
│           ├── ImageUploader.jsx
│           ├── Registration.jsx
│           └── ...
│       ├── package.json           # Frontend dependencies & scripts
│       └── vite.config.js         # Vite configuration
├── backend/
│   ├── server.js                  # Express API server
│   ├── .env                       # Environment variables (SECRET)
│   ├── package.json               # Backend dependencies & scripts
│   └── prisma/
│       └── schema.prisma          # Database schema
└── README.md
```

---

## 🛣️ Routes

| Path | Component | Description |
|------|-----------|-------------|
| `/` | `HomePage` | Hero banner, about section, stats, event overview |
| `/hackathon` | `HackathonPage` | Problem statements, prizes, rules, dates, registration |
| `/schedule` | `SchedulePage` | 3-day conference timeline with day tabs |
| `/speakers` | `SpeakersPage` | Speaker cards with bio, photo, social links |
| `/sponsors` | `SponsorsPage` | Sponsor tiers (Title → Community) with logos |
| `/team` | `TeamPage` | Organizing committee by category |
| `/register` | `Registration` | Google Form–based registration |
| `/contact` | `ContactPage` | Contact form, map, email/phone info |
| `/admin` | `AdminLoginPage` | Admin login panel |

---

## 🔗 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/admin/login` | Login with env credentials |
| `POST` | `/admin/logout` | Clear auth cookies |
| `POST` | `/admin/refresh` | Refresh JWT token |
| `GET` | `/admin/me` | Get current admin session |

### Resources (Protected — require admin JWT)
| Resource | GET (list) | POST (create) | PUT (update) | DELETE |
|----------|-----------|---------------|-------------|--------|
| Speakers | `/api/speakers` | `/api/speakers` | `/api/speakers/:id` | `/api/speakers/:id` |
| Sponsors | `/api/sponsors` | `/api/sponsors` | `/api/sponsors/:id` | `/api/sponsors/:id` |
| Events | `/api/events` | `/api/events` | `/api/events/:id` | `/api/events/:id` |
| Team | `/api/team` | `/api/team` | `/api/team/:id` | `/api/team/:id` |

### Other
| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload` | Upload image to Cloudinary |
| `POST` | `/api/contact` | Submit contact form email |

---

## 🗄️ Database Schema

| Model | Key Fields |
|-------|-----------|
| `AdminUser` | email, password (hashed), verified, role |
| `Speaker` | name, title, bio, photoURL, linkedin, github, sortOrder |
| `Sponsor` | name, logoURL, website, category, sortOrder |
| `Event` | title, date, time, type, details, sortOrder |
| `TeamMember` | name, role, category, photoURL, contact, sortOrder |
| `AuditLog` | action, resource, adminEmail, ipAddress, timestamp |
| `SiteConfig` | key, value (dynamic site configuration) |
| `ContactMessage` | name, email, message, createdAt |

Full schema: [`backend/prisma/schema.prisma`](backend/prisma/schema.prisma)

---

## 🔐 Admin Access

1. Navigate to `/admin` in the browser
2. Login with the `ADMIN_USERNAME` and `ADMIN_PASSWORD` from your `.env`
3. Once authenticated, every page shows admin controls:
   - **+ Add** buttons for creating new records
   - **Edit / Delete** buttons on each card
   - **Drag to Reorder** capability on all card grids
   - **Site Config** modal for editing section titles & subtitles

---

## 🐛 Troubleshooting

| Issue | Fix |
|-------|-----|
| **Blank page** | Check browser console for errors. Ensure `npm install` was run. |
| **Can't login** | Verify `ADMIN_USERNAME` / `ADMIN_PASSWORD` in `backend/.env`. Restart backend. |
| **Database error** | Check `DATABASE_URL`. For Aiven, ensure `?ssl-mode=REQUIRED` is appended. |
| **Images not uploading** | Verify Cloudinary credentials in `.env`. Check free tier quota. |
| **Contact email not sent** | Use Gmail App Password (not regular password). Check spam folder. |
| **401 on /admin/me** | Expected for non-authenticated users. Not a bug. |

---

## 📧 Email Setup

### Gmail (Recommended for testing)
1. Go to [Google App Passwords](https://myaccount.google.com/apppasswords)
2. Generate a 16-character app password
3. Set `EMAIL_USER` and `EMAIL_PASS` in `backend/.env`

### Custom SMTP
```env
SMTP_HOST=smtp.yourserver.com
SMTP_PORT=587
SMTP_USER=your-email@company.com
SMTP_PASS=your-password
SMTP_SECURE=false
```

---

## 👥 Team

Developed for the **OOSC 4.0 Conference** at **IIIT Allahabad** (Aug 28–30, 2026).

## 📝 License

Private project. All rights reserved.
