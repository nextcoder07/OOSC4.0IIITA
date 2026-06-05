/**
 * Password Hash Generator for OOSC Admin
 * 
 * Usage: node hash.js <password>
 * 
 * Generates a bcrypt hash that you can paste into backend/.env
 * as the ADMIN_PASSWORD_HASH value.
 */
import bcrypt from 'bcrypt'

const password = process.argv[2]

if (!password) {
  console.error('Usage: node hash.js <password>')
  console.error('Example: node hash.js "MyStr0ng!Pass"')
  process.exit(1)
}

const hash = await bcrypt.hash(password, 12)
console.log('\nGenerated bcrypt hash:')
console.log(hash)
console.log('\nPaste this into backend/.env as:')
console.log(`ADMIN_PASSWORD_HASH="${hash}"`)
