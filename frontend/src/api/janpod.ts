/**
 * Client ของ Janpod Backend (Express + Prisma ORM + Supabase PostgreSQL) ในโฟลเดอร์ backend/
 * ข้อมูลทุกอย่างในแอปมาจาก API นี้เท่านั้น (ไม่เรียก API ภายนอก)
 *
 * - ตอน dev: ใช้ "/api" แล้ว Vite proxy ส่งต่อไปที่ http://localhost:3000 (ดู vite.config.ts)
 * - ตอน deploy: ตั้งค่า VITE_API_URL เช่น https://janpod-api.example.com/api
 */
import type { Category, Favorite, Ingredient, Meal, MealCardData, User } from '../types/meal'

export const API_URL: string = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '') || '/api'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new ApiError(body?.error ?? `Request failed (HTTP ${res.status})`, res.status)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

// ---------- รูปแบบ response จาก Backend (ตรงกับ Prisma model) ----------
interface DbCategory {
  id: number
  name: string
  thumbnail: string | null
  description: string | null
  _count?: { meals: number }
}

interface DbMealSummary {
  id: string
  name: string
  thumbnail: string
  area: string | null
  category: { name: string } | null
}

interface DbMeal extends DbMealSummary {
  instructions: string | null
  tags: string | null
  youtube: string | null
  source: string | null
  ingredients: { measure: string | null; position: number; ingredient: { name: string } }[]
}

interface DbFavorite {
  id: number
  mealId: string
  note: string | null
  createdAt: string
  meal: DbMealSummary
}

// ---------- แปลงข้อมูลจาก DB ให้เป็นรูปแบบที่ UI ใช้ ----------
function toCategory(c: DbCategory): Category {
  return {
    idCategory: String(c.id),
    strCategory: c.name,
    strCategoryThumb: c.thumbnail ?? '',
    strCategoryDescription: c.description ?? '',
    mealCount: c._count?.meals ?? 0,
  }
}

function toCard(m: DbMealSummary): MealCardData {
  return {
    idMeal: m.id,
    strMeal: m.name,
    strMealThumb: m.thumbnail,
    strCategory: m.category?.name ?? null,
    strArea: m.area,
  }
}

function toMeal(m: DbMeal): Meal {
  const ingredients: Ingredient[] = m.ingredients.map((row) => ({
    name: row.ingredient.name,
    measure: row.measure ?? '',
  }))
  return {
    ...toCard(m),
    strCategory: m.category?.name ?? null,
    strArea: m.area,
    strInstructions: m.instructions,
    strTags: m.tags,
    strYoutube: m.youtube,
    strSource: m.source,
    ingredients,
  }
}

function toFavorite(f: DbFavorite): Favorite {
  return { id: f.id, mealId: f.mealId, note: f.note, createdAt: f.createdAt, meal: toCard(f.meal) }
}

// ---------- Meals & Categories ----------

/** GET /api/categories */
export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  return (await call<DbCategory[]>('/categories', { signal })).map(toCategory)
}

/** GET /api/meals?search=&category= — ค้นหาตามชื่อ และ/หรือ กรองตามหมวด */
export async function fetchMeals(search: string, category: string | null, signal?: AbortSignal): Promise<MealCardData[]> {
  const params = new URLSearchParams()
  if (search) params.set('search', search)
  if (category) params.set('category', category)
  const query = params.toString()
  return (await call<DbMealSummary[]>(`/meals${query ? `?${query}` : ''}`, { signal })).map(toCard)
}

/** GET /api/meals/:id — คืน null เมื่อไม่พบ (404) */
export async function fetchMealById(id: string, signal?: AbortSignal): Promise<Meal | null> {
  try {
    return toMeal(await call<DbMeal>(`/meals/${encodeURIComponent(id)}`, { signal }))
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null
    throw error
  }
}

/** GET /api/meals/random */
export async function fetchRandomMeal(signal?: AbortSignal): Promise<Meal> {
  return toMeal(await call<DbMeal>('/meals/random', { signal }))
}

// ---------- Users & Favorites (Personal Collection) ----------

/** POST /api/users/identify — หา/สร้างผู้ใช้จากอีเมล */
export function identify(email: string): Promise<User> {
  return call<User>('/users/identify', { method: 'POST', body: JSON.stringify({ email }) })
}

/** GET /api/users/:userId/favorites */
export async function fetchFavorites(userId: number, signal?: AbortSignal): Promise<Favorite[]> {
  return (await call<DbFavorite[]>(`/users/${userId}/favorites`, { signal })).map(toFavorite)
}

/** POST /api/users/:userId/favorites */
export async function addFavorite(userId: number, mealId: string, note?: string): Promise<Favorite> {
  return toFavorite(
    await call<DbFavorite>(`/users/${userId}/favorites`, { method: 'POST', body: JSON.stringify({ mealId, note }) }),
  )
}

/** PATCH /api/users/:userId/favorites/:mealId — แก้โน้ต */
export async function updateFavoriteNote(userId: number, mealId: string, note: string): Promise<Favorite> {
  return toFavorite(
    await call<DbFavorite>(`/users/${userId}/favorites/${encodeURIComponent(mealId)}`, {
      method: 'PATCH',
      body: JSON.stringify({ note }),
    }),
  )
}

/** DELETE /api/users/:userId/favorites/:mealId */
export function removeFavorite(userId: number, mealId: string): Promise<void> {
  return call<void>(`/users/${userId}/favorites/${encodeURIComponent(mealId)}`, { method: 'DELETE' })
}

/** DELETE /api/users/:userId/favorites — ล้างทั้งหมด */
export function clearFavorites(userId: number): Promise<{ deleted: number }> {
  return call<{ deleted: number }>(`/users/${userId}/favorites`, { method: 'DELETE' })
}
