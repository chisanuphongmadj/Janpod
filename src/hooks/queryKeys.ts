/** รวม queryKey ไว้ที่เดียว แยกตามหมวด / คำค้น / id เพื่อให้ cache ใช้ร่วมกันได้ทุกหน้า */
export const mealKeys = {
  all: ['meals'] as const,
  categories: () => [...mealKeys.all, 'categories'] as const,
  search: (term: string) => [...mealKeys.all, 'search', term] as const,
  byCategory: (category: string) => [...mealKeys.all, 'category', category] as const,
  detail: (id: string) => [...mealKeys.all, 'detail', id] as const,
  random: () => [...mealKeys.all, 'random'] as const,
}
