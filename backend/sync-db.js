import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const dbPath = path.join(__dirname, 'prisma', 'dev.db').replace(/\\/g, '/')
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || `file:${dbPath}`,
    },
  },
})

async function run() {
  console.log('Initializing Local SQLite Database file...')
  
  // This creates your tables natively without needing the broken npx prisma tool!
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Speaker (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, title TEXT NOT NULL, bio TEXT NOT NULL, photoURL TEXT, sortOrder INTEGER DEFAULT 0, published BOOLEAN DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)
  
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Sponsor (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, logoURL TEXT, category TEXT NOT NULL, website TEXT, sortOrder INTEGER DEFAULT 0, published BOOLEAN DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Event (
      id INTEGER PRIMARY KEY AUTOINCREMENT, title TEXT NOT NULL, description TEXT NOT NULL, date TEXT NOT NULL, time TEXT NOT NULL, type TEXT NOT NULL, sortOrder INTEGER DEFAULT 0, published BOOLEAN DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS TeamMember (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, role TEXT NOT NULL, contact TEXT NOT NULL, photoURL TEXT, sortOrder INTEGER DEFAULT 0, published BOOLEAN DEFAULT 1, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS Lead (
      id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, email TEXT NOT NULL, affiliation TEXT, message TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS AuditLog (
      id INTEGER PRIMARY KEY AUTOINCREMENT, adminEmail TEXT NOT NULL, action TEXT NOT NULL, resource TEXT NOT NULL, ipAddress TEXT NOT NULL, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `)

  console.log('🚀 SUCCESS! Local "dev.db" file created with all tables ready to go!')
}

run()
  .catch(err => console.error('❌ Connection Failed:', err.message))
  .finally(() => prisma.$disconnect())