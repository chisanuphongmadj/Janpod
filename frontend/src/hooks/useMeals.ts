import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCategories, fetchMealById, fetchMeals, fetchRandomMeal } from '../api/janpod'
import type { Meal } from '../types/meal'
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

/** รายการเมนูบนหน้าหลัก: GET /api/meals?search=&category= (ค้นหาและกรองที่ฝั่ง Backend/DB) */
export function useMealList(search: string, category: string | null) {
  const term = search.trim()
  return useQuery({
    queryKey: mealKeys.list(term, category),
    queryFn: ({ signal }) => fetchMeals(term, category, signal),
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

/** สุ่มเมนู: ปิด refetch อัตโนมัติ ให้สุ่มใหม่เฉพาะตอนกดปุ่ม (เรียก refetch) */
export function useRandomMeal() {
  const queryClient = useQueryClient()
  return useQuery<Meal>({
    queryKey: mealKeys.random(),
    queryFn: async ({ signal }) => {
      const meal = await fetchRandomMeal(signal)
      // ใส่ลง cache ของหน้า detail ไว้ก่อน ทำให้เปิดหน้า detail ได้ทันที
      queryClient.setQueryData(mealKeys.detail(meal.idMeal), meal)
      return meal
    },
    staleTime: Infinity,
    refetchOnWindowFocus: false,
  })
}
