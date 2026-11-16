/**
 * Types ของข้อมูลที่ใช้ใน UI
 * ข้อมูลทั้งหมดมาจาก Janpod Backend (Express + Prisma + Supabase) — ดูการแปลงใน src/api/janpod.ts
 */

export interface Ingredient {
  name: string
  measure: string
}

/** การ์ดเมนูที่ใช้แสดงผลใน UI */
export interface MealCardData {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory?: string | null
  strArea?: string | null
}

/** ข้อมูลเต็มของเมนู (หน้า detail / หน้าสุ่ม) */
export interface Meal extends MealCardData {
  strCategory: string | null
  strArea: string | null
  strInstructions: string | null
  strTags: string | null
  strYoutube: string | null
  strSource: string | null
  ingredients: Ingredient[]
}

export interface Category {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
  mealCount: number
}

/** ผู้ใช้ (ระบุตัวตนแบบง่ายด้วยอีเมล) */
export interface User {
  id: number
  email: string
  displayName: string | null
}

/** เมนูใน "สูตรของฉัน" (แถวในตาราง favorites + ข้อมูลสรุปของเมนู) */
export interface Favorite {
  id: number
  mealId: string
  note: string | null
  createdAt: string
  meal: MealCardData
}
