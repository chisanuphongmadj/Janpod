# Janpod — เว็บแอปคลังสูตรอาหาร (Full-Stack CRUD) · Week13 HW3

ค้นหาเมนู ดูวัตถุดิบและวิธีทำ แล้วเก็บสูตรโปรดไว้ใน "สูตรของฉัน" (Personal Collection) พร้อมเขียนโน้ตได้
พัฒนาต่อจาก Mini Project 2 เป็นระบบ **Full-Stack**: Frontend (React) ↔ Backend RESTful API (Express) ↔ Prisma ORM ↔ Supabase PostgreSQL

> ข้อมูลทุกอย่างในแอปมาจาก Backend + Database ของกลุ่มเอง **ไม่มีการเรียก API ภายนอก** และไม่มีข้อมูลฝังไว้ใน code
> ข้อมูลตัวอย่างมาจาก API เดิม (TheMealDB) ที่นำมาแยกเป็นตารางแล้วใส่ผ่าน `backend/prisma/seed.ts`

## สมาชิกกลุ่ม

| ชื่อ-นามสกุล | รหัสนักศึกษา | หน้าที่รับผิดชอบ |
| --- | --- | --- |
| ดำรงค์ สว่างวงศ์ | 1660707173 | Front-End / UI |
| ชิษณุพงศ์ มัดจุปะ | 1660707306 | Backend API, Prisma schema, seed, เชื่อม TanStack Query |
| พงศภัค สงวนสุทธิ์ | 1660707884 | เอกสาร, ทดสอบ, Deploy |

## โครงสร้างโฟลเดอร์

```
Janpod/
├── frontend/                 # React 19 + Vite + TypeScript + React Router v7 + TanStack Query v5 + Zustand + Tailwind/DaisyUI
│   ├── src/api/janpod.ts     # ฟังก์ชันเรียก Backend ทั้งหมด (+ แปลงข้อมูล DB -> UI)
│   ├── src/hooks/            # useMeals (meals/categories/random), useFavorites (CRUD สูตรของฉัน)
│   ├── src/store/            # Zustand: sessionStore (ผู้ใช้ที่ระบุอีเมล), filterStore (คำค้น/หมวด)
│   ├── src/pages/            # Home, RecipeDetail, Favorites, About, Random, NotFound
│   └── ...
├── backend/                  # Express 5 + Prisma ORM + Supabase PostgreSQL
│   ├── prisma/schema.prisma  # Relational model 6 ตาราง
│   ├── prisma/seed.ts        # ใส่ข้อมูลตัวอย่าง
│   ├── prisma/data/          # JSON ข้อมูลตัวอย่างที่ seed.ts ใช้
│   ├── prisma/migrations/
│   └── src/                  # index.ts, routes/ (users, favorites, meals, categories)
└── screenshots/              # ภาพหน้าจอทุกหน้า + ภาพ Schema database
```

## หน้าในระบบ

| Route | หน้า | Backend API ที่ใช้ |
| --- | --- | --- |
| `/` | หน้าหลัก: ค้นหาเมนูและกรองตามหมวด | `GET /api/meals?search=&category=`, `GET /api/categories` |
| `/recipe/:id` | รายละเอียดสูตร: วัตถุดิบ วิธีทำ วิดีโอ | `GET /api/meals/:id` |
| `/favorites` | สูตรของฉัน (ระบุตัวตนด้วยอีเมล) เพิ่ม / ดู / แก้โน้ต / ลบ / ล้างทั้งหมด | `POST /api/users/identify`, `GET·POST·PATCH·DELETE /api/users/:id/favorites` |
| `/random` | หน้าพิเศษ: สุ่มเมนู "วันนี้กินอะไรดี?" | `GET /api/meals/random` |
| `/about` | ข้อมูลผู้พัฒนา + สถาปัตยกรรม | – |

## Database Schema (Prisma)

| ตาราง | PK | FK | Unique |
| --- | --- | --- | --- |
| `users` | `id` | | `email`, `phone` |
| `categories` | `id` | | `name` |
| `meals` | `id` | `category_id` → `categories.id` | |
| `ingredients` | `id` | | `name` |
| `meal_ingredients` | `id` | `meal_id` → `meals.id`, `ingredient_id` → `ingredients.id` | `(meal_id, ingredient_id)` |
| `favorites` | `id` | `user_id` → `users.id`, `meal_id` → `meals.id` | `(user_id, meal_id)` |

## วิธีรัน

### 1) Backend

```bash
cd backend
npm install
cp .env.example .env          # ใส่ DATABASE_URL และ DIRECT_URL จาก Supabase
npx prisma migrate deploy     # สร้างตาราง
npx prisma db seed            # ใส่ข้อมูลตัวอย่าง
npm run dev                   # http://localhost:3000/api
```

### 2) Frontend (เปิดอีก terminal)

```bash
cd frontend
npm install
npm run dev                   # http://localhost:5173 (Vite proxy ส่ง /api ไปที่ localhost:3000 ให้อัตโนมัติ)
```

ทดลองหน้า "สูตรของฉัน" ด้วยอีเมลตัวอย่างจาก seed เช่น `damrong@janpod.dev` หรือกรอกอีเมลใหม่เพื่อสร้างผู้ใช้ใหม่

## สถาปัตยกรรมฝั่ง Frontend

- **TanStack Query (Server State)**: ข้อมูลเมนู/หมวด/สูตรของฉันทั้งหมด queryKey แยกตามคำค้น+หมวด / id / ผู้ใช้
  การเพิ่ม-ลบ-แก้โน้ตใช้ `useMutation` แบบ optimistic update แล้ว invalidate เพื่อดึงข้อมูลจริงจาก DB
- **Zustand (Client State)**: `sessionStore` เก็บผู้ใช้ที่ระบุอีเมลแล้ว (persist ใน LocalStorage), `filterStore` เก็บคำค้น/หมวด
- **React Router v7**: Root Layout, Dynamic Route `/recipe/:id`, หน้า 404
