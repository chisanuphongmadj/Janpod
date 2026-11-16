/** รวม queryKey ไว้ที่เดียว แยกตามคำค้น+หมวด / id / ผู้ใช้ เพื่อให้ cache ใช้ร่วมกันได้ทุกหน้า */
export const mealKeys = {
  all: ['meals'] as const,
  categories: () => [...mealKeys.all, 'categories'] as const,
  list: (search: string, category: string | null) => [...mealKeys.all, 'list', search, category] as const,
  detail: (id: string) => [...mealKeys.all, 'detail', id] as const,
  random: () => [...mealKeys.all, 'random'] as const,
}

export const favoriteKeys = {
  all: ['favorites'] as const,
  byUser: (userId: number) => [...favoriteKeys.all, userId] as const,
}
