# Janpod Backend — Express + Prisma ORM + Supabase PostgreSQL

RESTful CRUD API ของ Janpod (Mini Project 2) พร้อมระบบ Personal Collection "สูตรของฉัน"
ระบุตัวตนแบบง่ายด้วยอีเมล (ไม่มีรหัสผ่าน ใช้สำหรับงานเรียนเท่านั้น)

## Relational Model (`prisma/schema.prisma`)

| ตาราง | PK | FK | Unique |
| --- | --- | --- | --- |
| `users` | `id` | | `email`, `phone` |
| `categories` | `id` | | `name` |
| `meals` | `id` (idMeal) | `category_id` → `categories.id` | |
| `ingredients` | `id` | | `name` |
| `meal_ingredients` | `id` | `meal_id` → `meals.id`, `ingredient_id` → `ingredients.id` | `@@unique([mealId, ingredientId])` |
| `favorites` | `id` | `user_id` → `users.id`, `meal_id` → `meals.id` | `@@unique([userId, mealId])` |

## ติดตั้งและรัน

```bash
cd server
npm install
cp .env.example .env          # ใส่ DATABASE_URL และ DIRECT_URL จาก Supabase
npx prisma migrate deploy     # สร้างตารางตาม prisma/migrations (หรือ npx prisma migrate dev)
npx prisma db seed            # ใส่ข้อมูลตัวอย่างจาก ../sample-data
npm run dev                   # http://localhost:3000/api
```

ฝั่ง Frontend: สร้างไฟล์ `.env` ที่ root ของโปรเจกต์ ใส่ `VITE_API_URL=http://localhost:3000/api` แล้ว `npm run dev`
หน้า My Recipes จะมีช่องกรอกอีเมลเพื่อซิงก์สูตรของฉันกับฐานข้อมูล

## API

| Method | Path | คำอธิบาย |
| --- | --- | --- |
| GET | `/api/health` | ตรวจการเชื่อมต่อฐานข้อมูล |
| POST | `/api/users/identify` | `{ email }` หา/สร้างผู้ใช้จากอีเมล |
| GET / PATCH / DELETE | `/api/users/:userId` | ข้อมูลผู้ใช้ |
| GET | `/api/users/:userId/favorites` | สูตรของฉันทั้งหมด |
| POST | `/api/users/:userId/favorites` | `{ mealId, name?, thumbnail?, category?, note? }` บันทึกเมนู (ซ้ำ → 409) |
| PATCH | `/api/users/:userId/favorites/:mealId` | `{ note }` แก้โน้ต |
| DELETE | `/api/users/:userId/favorites/:mealId` | ลบเมนูออก |
| DELETE | `/api/users/:userId/favorites` | ล้างทั้งหมด |
| GET / POST | `/api/categories` | หมวดหมู่ |
| PATCH / DELETE | `/api/categories/:id` | |
| GET / POST | `/api/meals?search=&category=` | สูตรอาหาร |
| GET / PATCH / DELETE | `/api/meals/:id` | รายละเอียดพร้อมวัตถุดิบ |
