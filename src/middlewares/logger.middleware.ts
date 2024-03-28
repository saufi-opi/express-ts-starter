import { Request, Response, NextFunction } from 'express'
import logger from '../utils/logger'

export function loggerMiddleware(request: Request, response: Response, next: NextFunction) {
  logger.info({
    method: request.method,
    url: request.url
  })
  next()
}
