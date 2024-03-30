import { ApiError } from "../interfaces/api-error.interface"

export function createError (code: number, message: string): ApiError {
  const err: ApiError = new Error(message)
  err.statusCode = code ?? 500
  return err
}

export function createErrorFactory (namespace: string, prefix = 'error'): typeof createError {
  return function (code: number, message: string): ApiError {
    return createError(code, `${prefix}.${namespace}.${message}`)
  }
}