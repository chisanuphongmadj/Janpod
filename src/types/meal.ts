/**
 * Types ของข้อมูลจาก TheMealDB API (https://www.themealdb.com/api.php)
 * กำหนดทุก field ที่ใช้งานอย่างละเอียด ไม่ใช้ any
 */

/** เลขลำดับ 1-20 ของวัตถุดิบ/ปริมาณ ที่ API ส่งมาเป็น field แยก (strIngredient1 ... strIngredient20) */
export type IngredientIndex =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10
  | 11 | 12 | 13 | 14 | 15 | 16 | 17 | 18 | 19 | 20

export type MealIngredientFields = {
  [K in IngredientIndex as `strIngredient${K}`]: string | null
} & {
  [K in IngredientIndex as `strMeasure${K}`]: string | null
}

/** ข้อมูลสรุปของเมนู (จาก filter.php) */
export interface MealSummary {
  idMeal: string
  strMeal: string
  strMealThumb: string
}

/** ข้อมูลเต็มของเมนู (จาก search.php, lookup.php, random.php) */
export interface Meal extends MealSummary, MealIngredientFields {
  strMealAlternate: string | null
  strCategory: string | null
  strArea: string | null
  strInstructions: string | null
  strTags: string | null
  strYoutube: string | null
  strSource: string | null
  strImageSource: string | null
  strCreativeCommonsConfirmed: string | null
  dateModified: string | null
}

export interface Category {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
}

/** รูปแบบ response ของแต่ละ endpoint (API ส่ง meals: null เมื่อไม่พบข้อมูล) */
export interface MealsResponse<T> {
  meals: T[] | null
}

export interface CategoriesResponse {
  categories: Category[]
}

/** การ์ดเมนูที่ใช้แสดงผลใน UI (category อาจไม่มีเมื่อมาจาก filter.php) */
export interface MealCardData extends MealSummary {
  strCategory?: string | null
  strArea?: string | null
}

export interface Ingredient {
  name: string
  measure: string
}
