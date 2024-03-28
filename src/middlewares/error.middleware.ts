import { Request, Response, NextFunction} from 'express'
import { ApiError } from '../interfaces/api-error.interface';
import { ErrorResponse } from '../interfaces/response.interface';

export function errorMiddleware (error: ApiError, _request: Request, response: Response<ErrorResponse>, next: NextFunction) {
  try {
    error.statusCode ??= 500
    error.message ??= 'default-error-message'
    console.log(error.statusCode, error.message)
    response.json({statusCode: error.statusCode, success: false, message: error.message})
  } catch (error) {
    next(error)
  }
}