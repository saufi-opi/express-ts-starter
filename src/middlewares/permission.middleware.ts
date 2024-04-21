import PermissionClaimBuilder from '../permissions/permissions.builder'
import { createError } from '../utils/error'
import { Request, Response, NextFunction } from 'express'

declare module 'express' {
  interface Request {
    permissionClaimBuilder: PermissionClaimBuilder
  }
}

export function validateRoleMiddleware(roles: string[]) {
  return (request: Request, _response: Response, next: NextFunction) => {
    if (roles.includes(request.role)) {
      next()
    } else {
      throw createError(401, 'error.no-permission')
    }
  }
}

export function validateActionMiddleware(resourceRef: string, FLAGS: number) {
  return (request: Request, _response: Response, next: NextFunction) => {
    // TODO
  }
}

export function permissionClaimBuilderMiddleware(request: Request, _response: Response, next: NextFunction) {
  const builder = new PermissionClaimBuilder()
  request.permissionClaimBuilder = builder
  // TODO: set collection for claim builder
  next()
}
