import type { Ingredient, IngredientIndex, Meal } from '../types/meal'

const INGREDIENT_INDEXES: IngredientIndex[] = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
]

/** แปลง strIngredient1..20 / strMeasure1..20 ให้เป็น array ที่ใช้งานง่าย */
export function getIngredients(meal: Meal): Ingredient[] {
  return INGREDIENT_INDEXES.flatMap((i) => {
    const name = meal[`strIngredient${i}`]?.trim()
    if (!name) return []
    return [{ name, measure: meal[`strMeasure${i}`]?.trim() ?? '' }]
  })
}

/** แยกวิธีทำเป็นขั้นตอน และตัดหัวข้อ "STEP 1" หรือเลขลำดับที่ API ใส่มาเองออก */
export function getSteps(instructions: string | null): string[] {
  if (!instructions) return []
  return instructions
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => !/^(step\s*)?\d+[.):]?$/i.test(line))
    .map((line) => line.replace(/^(step\s*\d+[.):]?\s*|\d+[.)]\s+)/i, '').trim())
    .filter((line) => line.length > 0)
}

export function getTags(meal: Meal): string[] {
  return (meal.strTags ?? '')
    .split(',')
    .map((tag) => tag.trim())
    .filter((tag) => tag.length > 0)
}

export function ingredientImage(name: string): string {
  return `https://www.themealdb.com/images/ingredients/${encodeURIComponent(name)}-small.png`
}
