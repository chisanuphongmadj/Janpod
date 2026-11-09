import express from 'express'
import cors from 'cors'
import { prisma } from './prisma.js'
import { errorHandler } from './http.js'
import { usersRouter } from './routes/users.js'
import { favoritesRouter } from './routes/favorites.js'
import { categoriesRouter, mealsRouter } from './routes/meals.js'

const app = express()
const PORT = Number(process.env.PORT ?? 3000)

app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') ?? true }))
app.use(express.json())

app.get('/api/health', async (_req, res) => {
  await prisma.$queryRaw`SELECT 1`
  res.json({ ok: true })
})

app.use('/api/users', usersRouter)
app.use('/api/users/:userId/favorites', favoritesRouter)
app.use('/api/categories', categoriesRouter)
app.use('/api/meals', mealsRouter)

app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' })
})
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`🍳 Janpod API running at http://localhost:${PORT}/api`)
})
