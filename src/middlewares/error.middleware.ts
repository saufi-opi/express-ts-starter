import { Request, Response, NextFunction } from 'express'
import { ApiError } from '../interfaces/api-error.interface'
import { ErrorResponse } from '../interfaces/response.interface'
import logger from '../utils/logger'

export function errorMiddleware(error: ApiError, _request: Request, response: Response<ErrorResponse>, next: NextFunction) {
  try {
    error.statusCode ??= 500
    error.message ??= 'default-error-message'

    logger.error({ statusCode: error.statusCode, message: error.message })
    response.status(error.statusCode).json({ statusCode: error.statusCode, success: false, message: error.message })
  } catch (error) {
    next(error)
  }
}
