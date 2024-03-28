import { Request, Response, NextFunction } from 'express'
import { Account } from '../interfaces/account.interface'
import { createError } from '../utils/error'

declare module 'express' {
  interface Request {
    user: Account
    role: string
  }
}

// TODO: auth middleware
export function authMiddleware(request: Request, response: Response, next: NextFunction) {
  next()
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  if (request.role !== 'guest') {
    return next()
  }
  throw createError(401, 'error.no-permission')
}
