import { Router } from 'express'
import { prisma } from '../prisma.js'
import { HttpError, intParam, optionalString, requireString } from '../http.js'

export const usersRouter = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/**
 * POST /api/users/identify  { email, displayName? }
 * ระบุตัวตนแบบง่าย: มีอีเมลนี้แล้วคืนผู้ใช้เดิม ถ้ายังไม่มีสร้างใหม่ (ไม่ใช้รหัสผ่าน)
 */
usersRouter.post('/identify', async (req, res) => {
  const email = requireString(req.body?.email, 'email').toLowerCase()
  if (!EMAIL_RE.test(email)) throw new HttpError(400, 'Invalid email')
  const displayName = optionalString(req.body?.displayName)
  const user = await prisma.user.upsert({
    where: { email },
    update: displayName !== undefined ? { displayName } : {},
    create: { email, displayName: displayName ?? null },
  })
  res.json(user)
})

usersRouter.get('/', async (_req, res) => {
  res.json(
    await prisma.user.findMany({
      orderBy: { id: 'asc' },
      include: { _count: { select: { favorites: true } } },
    }),
  )
})

usersRouter.get('/:userId', async (req, res) => {
  const user = await prisma.user.findUniqueOrThrow({ where: { id: intParam(req.params.userId, 'userId') } })
  res.json(user)
})

usersRouter.patch('/:userId', async (req, res) => {
  const user = await prisma.user.update({
    where: { id: intParam(req.params.userId, 'userId') },
    data: { displayName: optionalString(req.body?.displayName), phone: optionalString(req.body?.phone) },
  })
  res.json(user)
})

usersRouter.delete('/:userId', async (req, res) => {
  await prisma.user.delete({ where: { id: intParam(req.params.userId, 'userId') } })
  res.status(204).end()
})
