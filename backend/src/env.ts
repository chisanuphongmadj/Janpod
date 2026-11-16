/**
 * โหลดค่าจากไฟล์ backend/.env เข้า process.env ก่อนสร้าง PrismaClient
 * (prisma CLI อ่าน .env เองได้ แต่ตอนรันเซิร์ฟเวอร์ต้องโหลดเอง) — ใช้ฟีเจอร์ในตัวของ Node 20.12+
 */
import { existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const envPath = resolve(dirname(fileURLToPath(import.meta.url)), '../.env')

if (existsSync(envPath)) {
  process.loadEnvFile(envPath)
}

if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL is not set. Copy backend/.env.example to backend/.env and fill in your Supabase connection strings.')
  process.exit(1)
}
