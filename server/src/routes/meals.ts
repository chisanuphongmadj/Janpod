import { Router } from 'express'
import type { Prisma } from '@prisma/client'
import { prisma } from '../prisma.js'
import { HttpError, intParam, optionalString, requireString } from '../http.js'

export const mealsRouter = Router()
export const categoriesRouter = Router()

// ---------- Categories ----------
categoriesRouter.get('/', async (_req, res) => {
  res.json(
    await prisma.category.findMany({ orderBy: { id: 'asc' }, include: { _count: { select: { meals: true } } } }),
  )
})

categoriesRouter.post('/', async (req, res) => {
  const category = await prisma.category.create({
    data: {
      name: requireString(req.body?.name, 'name'),
      thumbnail: optionalString(req.body?.thumbnail) ?? null,
      description: optionalString(req.body?.description) ?? null,
    },
  })
  res.status(201).json(category)
})

categoriesRouter.patch('/:id', async (req, res) => {
  const category = await prisma.category.update({
    where: { id: intParam(req.params.id, 'id') },
    data: {
      name: req.body?.name === undefined ? undefined : requireString(req.body.name, 'name'),
      thumbnail: optionalString(req.body?.thumbnail),
      description: optionalString(req.body?.description),
    },
  })
  res.json(category)
})

categoriesRouter.delete('/:id', async (req, res) => {
  await prisma.category.delete({ where: { id: intParam(req.params.id, 'id') } })
  res.status(204).end()
})

// ---------- Meals ----------
const mealInclude = {
  category: true,
  ingredients: { orderBy: { position: 'asc' }, include: { ingredient: true } },
} satisfies Prisma.MealInclude

// GET /api/meals?search=curry&category=Chicken
mealsRouter.get('/', async (req, res) => {
  const search = typeof req.query.search === 'string' ? req.query.search.trim() : ''
  const category = typeof req.query.category === 'string' ? req.query.category.trim() : ''
  const meals = await prisma.meal.findMany({
    where: {
      ...(search && { name: { contains: search, mode: 'insensitive' } }),
      ...(category && { category: { name: category } }),
    },
    orderBy: { name: 'asc' },
    include: { category: true },
  })
  res.json(meals)
})

mealsRouter.get('/:id', async (req, res) => {
  res.json(await prisma.meal.findUniqueOrThrow({ where: { id: req.params.id }, include: mealInclude }))
})

async function categoryIdFrom(value: unknown): Promise<number | null | undefined> {
  if (value === undefined) return undefined
  if (value === null || value === '') return null
  const category = await prisma.category.findUnique({ where: { name: requireString(value, 'category') } })
  if (!category) throw new HttpError(400, `Unknown category "${String(value)}"`)
  return category.id
}

// POST /api/meals { id, name, thumbnail, category?, area?, instructions?, tags?, youtube? }
mealsRouter.post('/', async (req, res) => {
  const b = req.body ?? {}
  const meal = await prisma.meal.create({
    data: {
      id: requireString(b.id, 'id'),
      name: requireString(b.name, 'name'),
      thumbnail: requireString(b.thumbnail, 'thumbnail'),
      area: optionalString(b.area) ?? null,
      instructions: optionalString(b.instructions) ?? null,
      tags: optionalString(b.tags) ?? null,
      youtube: optionalString(b.youtube) ?? null,
      categoryId: (await categoryIdFrom(b.category)) ?? null,
    },
    include: mealInclude,
  })
  res.status(201).json(meal)
})

mealsRouter.patch('/:id', async (req, res) => {
  const b = req.body ?? {}
  const meal = await prisma.meal.update({
    where: { id: req.params.id },
    data: {
      name: b.name === undefined ? undefined : requireString(b.name, 'name'),
      thumbnail: b.thumbnail === undefined ? undefined : requireString(b.thumbnail, 'thumbnail'),
      area: optionalString(b.area),
      instructions: optionalString(b.instructions),
      tags: optionalString(b.tags),
      youtube: optionalString(b.youtube),
      categoryId: await categoryIdFrom(b.category),
    },
    include: mealInclude,
  })
  res.json(meal)
})

mealsRouter.delete('/:id', async (req, res) => {
  await prisma.meal.delete({ where: { id: req.params.id } })
  res.status(204).end()
})
