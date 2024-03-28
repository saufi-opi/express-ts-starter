import { Request, Response, NextFunction } from 'express'
import { Account } from '../interfaces/account.interface'

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
