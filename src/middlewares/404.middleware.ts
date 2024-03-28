import { Request, Response, NextFunction} from 'express'
import { createErrorFactory } from '../utils/error';

export function notFoundHandlerMiddleware (_request: Request, _response: Response, _next: NextFunction) {
  const createError = createErrorFactory('system')
  throw createError(404, 'not-found')
}