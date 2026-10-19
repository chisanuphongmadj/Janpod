import type {
  CategoriesResponse,
  Category,
  Meal,
  MealsResponse,
  MealSummary,
} from '../types/meal'

/** Base URL ของ TheMealDB (ใช้ test key "1" สำหรับการพัฒนา) */
const BASE_URL = 'https://www.themealdb.com/api/json/v1/1'

export class ApiError extends Error {
  readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request<T>(path: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(`${BASE_URL}/${path}`, { signal })
  if (!res.ok) {
    throw new ApiError(`Request failed (HTTP ${res.status})`, res.status)
  }
  return (await res.json()) as T
}

/** search.php?s={name} — ค้นหาเมนูตามชื่อ (ส่งค่าว่างจะได้เมนูเริ่มต้น 25 รายการ) */
export async function searchMeals(name: string, signal?: AbortSignal): Promise<Meal[]> {
  const data = await request<MealsResponse<Meal>>(
    `search.php?s=${encodeURIComponent(name)}`,
    signal,
  )
  return data.meals ?? []
}

/** categories.php — รายการหมวดหมู่ทั้งหมด */
export async function fetchCategories(signal?: AbortSignal): Promise<Category[]> {
  const data = await request<CategoriesResponse>('categories.php', signal)
  return data.categories
}

/** filter.php?c={category} — เมนูในหมวดที่เลือก */
export async function fetchMealsByCategory(
  category: string,
  signal?: AbortSignal,
): Promise<MealSummary[]> {
  const data = await request<MealsResponse<MealSummary>>(
    `filter.php?c=${encodeURIComponent(category)}`,
    signal,
  )
  return data.meals ?? []
}

/** lookup.php?i={id} — รายละเอียดของเมนู (คืน null เมื่อไม่พบ) */
export async function fetchMealById(id: string, signal?: AbortSignal): Promise<Meal | null> {
  const data = await request<MealsResponse<Meal>>(
    `lookup.php?i=${encodeURIComponent(id)}`,
    signal,
  )
  return data.meals?.[0] ?? null
}

/** random.php — สุ่มเมนู 1 รายการ */
export async function fetchRandomMeal(signal?: AbortSignal): Promise<Meal> {
  const data = await request<MealsResponse<Meal>>('random.php', signal)
  const meal = data.meals?.[0]
  if (!meal) throw new ApiError('No recipe returned from random.php', 500)
  return meal
}
