/**
 * Client ของ Janpod Backend (Express + Prisma + Supabase) ในโฟลเดอร์ server/
 * ตั้งค่า VITE_API_URL ในไฟล์ .env เช่น VITE_API_URL=http://localhost:3000/api
 * ถ้าไม่ได้ตั้งค่า แอปจะเก็บสูตรของฉันไว้ใน LocalStorage อย่างเดียวเหมือนเดิม
 */
import type { MealCardData } from '../types/meal'

export const API_URL: string | undefined = import.meta.env.VITE_API_URL?.replace(/\/$/, '') || undefined

export interface ApiUser {
  id: number
  email: string
  displayName: string | null
}

export interface ApiFavorite {
  id: number
  userId: number
  mealId: string
  note: string | null
  createdAt: string
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) throw new Error('VITE_API_URL is not set')
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  })
  if (!res.ok) {
    const body = (await res.json().catch(() => null)) as { error?: string } | null
    throw new Error(body?.error ?? `Request failed (HTTP ${res.status})`)
  }
  return (res.status === 204 ? undefined : await res.json()) as T
}

export const janpodApi = {
  identify: (email: string) =>
    call<ApiUser>('/users/identify', { method: 'POST', body: JSON.stringify({ email }) }),

  listFavorites: (userId: number) => call<ApiFavorite[]>(`/users/${userId}/favorites`),

  addFavorite: (userId: number, meal: MealCardData) =>
    call<ApiFavorite>(`/users/${userId}/favorites`, {
      method: 'POST',
      body: JSON.stringify({
        mealId: meal.idMeal,
        name: meal.strMeal,
        thumbnail: meal.strMealThumb,
        category: meal.strCategory ?? undefined,
      }),
    }),

  removeFavorite: (userId: number, mealId: string) =>
    call<void>(`/users/${userId}/favorites/${encodeURIComponent(mealId)}`, { method: 'DELETE' }),

  clearFavorites: (userId: number) => call<{ deleted: number }>(`/users/${userId}/favorites`, { method: 'DELETE' }),
}
