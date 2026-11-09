/**
 * Seed ข้อมูลตัวอย่างลงฐานข้อมูล (Supabase PostgreSQL)
 * รัน: npx prisma db seed   (หรือ npm run db:seed)
 *
 * ใช้ไฟล์ JSON จริงจาก TheMealDB ในโฟลเดอร์ ../sample-data
 *   categories.json      -> categories
 *   search-default.json  -> meals + ingredients + meal_ingredients (25 เมนู)
 *   lookup-52814.json    -> Thai Green Curry
 *   random-example.json  -> เมนูสุ่ม 1 เมนู
 * แล้วสร้างผู้ใช้ตัวอย่าง 3 คน + favorites ของแต่ละคน
 */
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const here = dirname(fileURLToPath(import.meta.url))
const sampleDir = resolve(here, '../../sample-data')

type ApiMeal = Record<string, string | null> & {
  idMeal: string
  strMeal: string
  strMealThumb: string
  strCategory: string | null
}
interface ApiCategory {
  idCategory: string
  strCategory: string
  strCategoryThumb: string
  strCategoryDescription: string
}

function readJson<T>(file: string): T {
  return JSON.parse(readFileSync(resolve(sampleDir, file), 'utf8')) as T
}

const categories = readJson<{ categories: ApiCategory[] }>('categories.json').categories
const meals: ApiMeal[] = [
  ...readJson<{ meals: ApiMeal[] }>('search-default.json').meals,
  ...readJson<{ meals: ApiMeal[] }>('lookup-52814.json').meals,
  ...readJson<{ meals: ApiMeal[] }>('random-example.json').meals,
]

const users = [
  { email: 'damrong@janpod.dev', phone: '0810000001', displayName: 'Damrong' },
  { email: 'chisanuphong@janpod.dev', phone: '0810000002', displayName: 'Chisanuphong' },
  { email: 'pongsapak@janpod.dev', phone: '0810000003', displayName: 'Pongsapak' },
]

/** favorites ตัวอย่าง: email -> [mealId, note] */
const favorites: Record<string, [string, string | null][]> = {
  'damrong@janpod.dev': [
    ['52814', 'ทำกินวันเสาร์'],
    ['53065', null],
    ['53151', 'ลองทำให้ที่บ้าน'],
  ],
  'chisanuphong@janpod.dev': [
    ['52814', 'เมนูโปรด'],
    ['53322', 'ของหวานงานวันเกิด'],
    ['53266', null],
    ['53133', null],
  ],
  'pongsapak@janpod.dev': [
    ['53269', 'กินคู่กับ Falafel'],
    ['53266', null],
  ],
}

function ingredientsOf(meal: ApiMeal) {
  const list: { name: string; measure: string | null; position: number }[] = []
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`]?.trim()
    if (!name) continue
    // ชื่อวัตถุดิบใน API มีตัวพิมพ์เล็ก/ใหญ่ปนกัน -> ทำให้เป็นรูปแบบเดียวกัน
    const normalized = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
    if (list.some((item) => item.name === normalized)) continue // กันซ้ำตามกฎ @@unique
    list.push({ name: normalized, measure: meal[`strMeasure${i}`]?.trim() || null, position: i })
  }
  return list
}

async function main() {
  console.log('🧹 Clearing old data...')
  await prisma.favorite.deleteMany()
  await prisma.mealIngredient.deleteMany()
  await prisma.ingredient.deleteMany()
  await prisma.meal.deleteMany()
  await prisma.category.deleteMany()
  await prisma.user.deleteMany()

  console.log(`📂 Seeding ${categories.length} categories...`)
  await prisma.category.createMany({
    data: categories.map((c) => ({
      id: Number(c.idCategory),
      name: c.strCategory,
      thumbnail: c.strCategoryThumb,
      description: c.strCategoryDescription,
    })),
  })
  // ใส่ id เองจึงต้องเลื่อน sequence ให้ต่อจากค่าสูงสุด ไม่งั้นการ insert ครั้งต่อไปจะชน PK
  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('categories', 'id'), (SELECT MAX(id) FROM categories))`,
  )
  const categoryIdByName = new Map(categories.map((c) => [c.strCategory, Number(c.idCategory)]))

  console.log(`🍲 Seeding ${meals.length} meals with ingredients...`)
  for (const m of meals) {
    await prisma.meal.upsert({
      where: { id: m.idMeal },
      update: {},
      create: {
        id: m.idMeal,
        name: m.strMeal,
        thumbnail: m.strMealThumb,
        area: m.strArea,
        instructions: m.strInstructions,
        tags: m.strTags,
        youtube: m.strYoutube || null,
        source: m.strSource || null,
        categoryId: m.strCategory ? (categoryIdByName.get(m.strCategory) ?? null) : null,
        ingredients: {
          create: ingredientsOf(m).map((ing) => ({
            measure: ing.measure,
            position: ing.position,
            ingredient: {
              connectOrCreate: { where: { name: ing.name }, create: { name: ing.name } },
            },
          })),
        },
      },
    })
  }

  console.log(`👤 Seeding ${users.length} users + favorites...`)
  for (const u of users) {
    const user = await prisma.user.create({ data: u })
    await prisma.favorite.createMany({
      data: (favorites[u.email] ?? []).map(([mealId, note]) => ({ userId: user.id, mealId, note })),
    })
  }

  const counts = {
    users: await prisma.user.count(),
    categories: await prisma.category.count(),
    meals: await prisma.meal.count(),
    ingredients: await prisma.ingredient.count(),
    meal_ingredients: await prisma.mealIngredient.count(),
    favorites: await prisma.favorite.count(),
  }
  console.table(counts)
  console.log('✅ Seed completed')
}

main()
  .catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
