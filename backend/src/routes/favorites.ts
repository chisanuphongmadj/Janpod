import { Router } from 'express'
import { prisma } from '../prisma.js'
import { intParam, optionalString, requireString } from '../http.js'

/** /api/users/:userId/favorites  — Personal Collection "สูตรของฉัน" */
export const favoritesRouter = Router({ mergeParams: true })

const mealSummary = { select: { id: true, name: true, thumbnail: true, area: true, category: { select: { name: true } } } }

// READ: รายการสูตรของฉัน (ใหม่สุดก่อน)
favoritesRouter.get('/', async (req, res) => {
  const userId = intParam((req.params as { userId?: string }).userId, 'userId')
  const items = await prisma.favorite.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: { meal: mealSummary },
  })
  res.json(items)
})

/**
 * CREATE: บันทึกเมนู { mealId, note? }
 * mealId ต้องมีอยู่ในตาราง meals (FK) ไม่งั้น -> 400
 * กดซ้ำเมนูเดิม -> 409 ตามกฎ @@unique([userId, mealId])
 */
favoritesRouter.post('/', async (req, res) => {
  const userId = intParam((req.params as { userId?: string }).userId, 'userId')
  const mealId = requireString(req.body?.mealId, 'mealId')

  const favorite = await prisma.favorite.create({
    data: { userId, mealId, note: optionalString(req.body?.note) ?? null },
    include: { meal: mealSummary },
  })
  res.status(201).json(favorite)
})

// UPDATE: แก้โน้ตของเมนูที่บันทึกไว้
favoritesRouter.patch('/:mealId', async (req, res) => {
  const userId = intParam((req.params as { userId?: string }).userId, 'userId')
  const favorite = await prisma.favorite.update({
    where: { userId_mealId: { userId, mealId: req.params.mealId } },
    data: { note: optionalString(req.body?.note) ?? null },
    include: { meal: mealSummary },
  })
  res.json(favorite)
})

// DELETE: ลบเมนูออกจากสูตรของฉัน
favoritesRouter.delete('/:mealId', async (req, res) => {
  const userId = intParam((req.params as { userId?: string }).userId, 'userId')
  await prisma.favorite.delete({ where: { userId_mealId: { userId, mealId: req.params.mealId } } })
  res.status(204).end()
})

// DELETE: ล้างทั้งหมด
favoritesRouter.delete('/', async (req, res) => {
  const userId = intParam((req.params as { userId?: string }).userId, 'userId')
  const { count } = await prisma.favorite.deleteMany({ where: { userId } })
  res.json({ deleted: count })
})
