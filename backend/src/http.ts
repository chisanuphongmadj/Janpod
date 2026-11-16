import type { NextFunction, Request, Response } from 'express'
import { Prisma } from '@prisma/client'

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message)
  }
}

/** แปลงพารามิเตอร์ :userId ให้เป็นตัวเลข */
export function intParam(value: string | undefined, name: string): number {
  const n = Number(value)
  if (!Number.isInteger(n) || n <= 0) throw new HttpError(400, `${name} must be a positive integer`)
  return n
}

export function requireString(value: unknown, name: string): string {
  if (typeof value !== 'string' || value.trim() === '') throw new HttpError(400, `${name} is required`)
  return value.trim()
}

export function optionalString(value: unknown): string | null | undefined {
  if (value === undefined) return undefined
  if (value === null) return null
  if (typeof value !== 'string') throw new HttpError(400, 'Invalid string field')
  return value.trim() || null
}

/** Error middleware: แปลง error ของ Prisma ให้เป็น HTTP status ที่เหมาะสม */
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === 'P2002') {
      res.status(409).json({ error: 'Duplicate entry (unique constraint)', target: err.meta?.target })
      return
    }
    if (err.code === 'P2025') {
      res.status(404).json({ error: 'Record not found' })
      return
    }
    if (err.code === 'P2003') {
      res.status(400).json({ error: 'Related record does not exist (foreign key)' })
      return
    }
  }
  console.error(err)
  res.status(500).json({ error: 'Internal server error' })
}
