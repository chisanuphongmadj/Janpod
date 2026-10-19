# Janpod — เว็บแอปคลังสูตรอาหาร (Mini Project 2)

ค้นหาเมนู ดูวัตถุดิบและวิธีทำ แล้วเก็บสูตรโปรดไว้ทำภายหลัง
พัฒนาแบบ **Modern Decoupled SPA**: React 19 + Vite + TypeScript + React Router v7 + Zustand + TanStack Query v5 + Tailwind CSS + DaisyUI

## สมาชิกกลุ่ม

| ชื่อ-นามสกุล | รหัสนักศึกษา | หน้าที่รับผิดชอบ |
| --- | --- | --- |
| ดำรงค์ สว่างวงศ์ | 1660707173 | Front-End / UI |
| ชิษณุพงศ์ มัดจุปะ | 1660707306 | เชื่อมต่อ TheMealDB ด้วย TanStack Query, Zustand store + persist |
| พงศภัค สงวนสุทธิ์ | 1660707884 | เอกสาร, ทดสอบ, Deploy |

## หน้าในระบบ (5 หน้า)

| Route | หน้า | ข้อมูลที่ใช้ |
| --- | --- | --- |
| `/` | หน้าหลัก: รายการสูตร 25 เมนู (หมวดละ 80+ เมนู) ค้นหาและกรองตามหมวดได้ | `search.php?s=`, `categories.php`, `filter.php?c=` |
| `/recipe/:id` | รายละเอียดสูตร (Dynamic Route): วัตถุดิบ วิธีทำ วิดีโอ | `lookup.php?i=` |
| `/favorites` | สูตรของฉัน (Personal Collection) เก็บถาวรด้วย LocalStorage | `favoriteIds` (Zustand) + `lookup.php?i=` |
| `/about` | ข้อมูลผู้พัฒนา + API Attribution | ข้อมูลคงที่ใน `src/data/team.ts` |
| `/random` | หน้าพิเศษ: สุ่มเมนู "วันนี้กินอะไรดี?" | `random.php` |

## สถาปัตยกรรม: แยก Client State กับ Server State

- **Zustand (Client State)**
  - `src/store/favoritesStore.ts`: `favoriteIds: string[]` + `toggleFavorite / removeFavorite / clear` ใช้ `persist` middleware บันทึกลง LocalStorage (key `janpod-favorites`) **เก็บเฉพาะ ID**
  - `src/store/filterStore.ts`: คำค้นและหมวดที่เลือกบนหน้าหลัก (ไม่ persist)
- **TanStack Query (Server State)**: `src/hooks/useMeals.ts`
  - queryKey แยกตามคำค้น / หมวด / id (`src/hooks/queryKeys.ts`)
  - `staleTime` 5 นาที (หมวดหมู่ 1 ชั่วโมง) ลดการเรียก API ซ้ำ
  - หน้าสูตรของฉันใช้ `useQueries` กับ queryKey เดียวกับหน้า detail จึงใช้ cache เดิมได้
  - ผลจาก search/random ถูกใส่ลง cache ของหน้า detail ด้วย `setQueryData` ทำให้เปิดหน้า detail ได้ทันที
  - หน้าสุ่มเมนูใช้ `refetch()` เพื่อสุ่มใหม่
- **React Router v7**: `createBrowserRouter` + Root Layout (`Navbar` + `<Outlet/>` + `Footer`), `<NavLink/>`, `useParams`, `errorElement`, หน้า 404
- **Loading / Error**: Skeleton ทุกจุดที่เรียก API, Error State พร้อมปุ่ม "ลองใหม่อีกครั้ง" (refetch)
- **Responsive**: มือถือใช้แถบเมนูด้านล่าง (DaisyUI dock), แท็บเล็ต/เดสก์ท็อปใช้ Navbar ด้านบน
- **TypeScript strict**: กำหนด Type ของ API ทุกตัวใน `src/types/meal.ts` ไม่ใช้ `any`

## โครงสร้างโฟลเดอร์

```
src/
├── api/mealdb.ts          # ฟังก์ชันเรียก TheMealDB API
├── components/            # RootLayout, Navbar, MobileDock, Footer, MealCard, FavoriteButton, StateViews ...
├── data/team.ts           # ข้อมูลผู้พัฒนา (หน้า About)
├── hooks/                 # TanStack Query hooks + queryKeys
├── lib/meal.ts            # helper แปลงวัตถุดิบ/ขั้นตอน
├── pages/                 # HomePage, RecipeDetailPage, FavoritesPage, AboutPage, RandomPage, NotFoundPage
├── store/                 # Zustand stores
├── types/meal.ts          # Types ของข้อมูล API
├── router.tsx
└── main.tsx
sample-data/               # ตัวอย่าง JSON ที่ได้จาก API แต่ละ endpoint
screenshots/               # ภาพหน้าจอระบบทุกหน้า
```

## วิธีรัน

```bash
npm install
npm run dev       # เปิด http://localhost:5173
npm run build     # type-check + build ไปที่ dist/
npm run preview   # ทดสอบไฟล์ที่ build แล้ว
```

## Deploy บน Netlify

มี `netlify.toml` และ `public/_redirects` ตั้งค่า SPA fallback ไว้แล้ว (เปิด `/recipe/52772` ตรง ๆ หรือรีเฟรชหน้าได้ ไม่เจอ 404)

- **วิธีที่ 1 (เร็วสุด)**: `npm run build` แล้วลากโฟลเดอร์ `dist` ไปวางที่ https://app.netlify.com/drop
- **วิธีที่ 2 (ผ่าน GitHub)**: push ขึ้น GitHub → Netlify → Add new site → Import from Git → เลือก repo (Build command `npm run build`, Publish directory `dist` อ่านจาก `netlify.toml` อัตโนมัติ)

## ที่มาของข้อมูล (API Attribution)

ข้อมูลสูตรอาหารและรูปภาพจาก [TheMealDB](https://www.themealdb.com) — เอกสาร API: https://www.themealdb.com/api.php
