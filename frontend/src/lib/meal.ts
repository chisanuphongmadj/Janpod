import type { Ingredient, Meal } from '../types/meal'

/** วัตถุดิบของเมนู (มาจากตาราง meal_ingredients เรียงตาม position แล้ว) */
export function getIngredients(meal: Meal): Ingredient[] {
  return meal.ingredients
}

/** แยกวิธีทำเป็นขั้นตอน และตัดหัวข้อ "STEP 1" หรือเลขลำดับที่ใส่มาในข้อความออก */
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
