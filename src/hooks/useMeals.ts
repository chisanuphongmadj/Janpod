import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  fetchCategories,
  fetchMealById,
  fetchMealsByCategory,
  fetchRandomMeal,
  searchMeals,
} from '../api/mealdb'
import type { Meal, MealCardData } from '../types/meal'
import { mealKeys } from './queryKeys'

const FIVE_MINUTES = 5 * 60 * 1000

/** หมวดหมู่แทบไม่เปลี่ยน จึงให้ข้อมูลสดอยู่นาน 1 ชั่วโมง */
export function useCategories() {
  return useQuery({
    queryKey: mealKeys.categories(),
    queryFn: ({ signal }) => fetchCategories(signal),
    staleTime: 60 * 60 * 1000,
  })
}

/**
 * รายการเมนูบนหน้าหลัก
 * - มีคำค้น   → search.php แล้วกรองหมวดฝั่ง client (ข้อมูลเต็มมี strCategory อยู่แล้ว)
 * - เลือกหมวด → filter.php
 * - ไม่มีทั้งคู่  → search.php?s= (เมนูเริ่มต้น 25 รายการ)
 */
export function useMealList(search: string, category: string | null) {
  const term = search.trim()
  const queryClient = useQueryClient()
  const bySearch = term !== '' || category === null

  return useQuery<MealCardData[]>({
    queryKey: bySearch ? mealKeys.search(term) : mealKeys.byCategory(category),
    queryFn: async ({ signal }) => {
      if (bySearch || category === null) {
        const meals = await searchMeals(term, signal)
        // ผลจาก search เป็นข้อมูลเต็ม จึงใส่ลง cache ของหน้า detail ไว้ก่อน ทำให้เปิดหน้า detail ได้ทันที
        meals.forEach((meal) => queryClient.setQueryData(mealKeys.detail(meal.idMeal), meal))
        return meals
      }
      const meals = await fetchMealsByCategory(category, signal)
      return meals.map((meal) => ({ ...meal, strCategory: category }))
    },
    select: (meals) =>
      term !== '' && category !== null
        ? meals.filter((meal) => meal.strCategory === category)
        : meals,
    staleTime: FIVE_MINUTES,
  })
}

export function useMeal(id: string) {
  return useQuery({
    queryKey: mealKeys.detail(id),
    queryFn: ({ signal }) => fetchMealById(id, signal),
    enabled: id !== '',
    staleTime: FIVE_MINUTES,
  })
}

/** ดึงรายละเอียดหลายเมนูพร้อมกัน (ใช้ queryKey เดียวกับหน้า detail จึงใช้ cache เดิมได้) */
export function useMealsByIds(ids: string[]) {
  return useQueries({
    queries: ids.map((id) => ({
      queryKey: mealKeys.detail(id),
      queryFn: ({ signal }: { signal: AbortSignal }) => fetchMealById(id, signal),
      staleTime: FIVE_MINUTES,
    })),
  })
}

/** สุ่มเมนู: ปิด refetch อัตโนมัติ ให้สุ่มใหม่เฉพาะตอนกดปุ่ม (เรียก refetch) */
export function useRandomMeal() {
  const queryClient = useQueryClient()
  return useQuery<Meal>({
    queryKey: mealKeys.random(),
    queryFn: async ({ signal }) => {
      const meal = await fetchRandomMeal(signal)
      queryClient.setQueryData(mealKeys.detail(meal.idMeal), meal)
      return meal
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
