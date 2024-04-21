import { Request, Response, NextFunction } from 'express'
import { Account, AccountModel, AccountRole } from '../routes/account/account.model'
import { createError } from '../utils/error'
import AccountService from '../routes/account/account.service'
import databaseNames from '../databases/database.names'
import { findTokenFromHeader, getAccountIdFromToken } from '../routes/authenticate/authenticate.helper'
import { AuthenticateService } from '../routes/authenticate/authenticate.service'
import { AuthenticateModel } from '../routes/authenticate/authenticate.model'

declare module 'express' {
  interface Request {
    account: Account
    role: AccountRole
  }
}

export async function authMiddleware(request: Request, _response: Response, next: NextFunction) {
  const accountService = new AccountService(AccountModel, { dbName: databaseNames.account })
  const authService = new AuthenticateService(AuthenticateModel, { dbName: databaseNames.authenticate })

  const token = findTokenFromHeader(request)
  if (token) {
    const accountId = getAccountIdFromToken(token)
    const authRecord = await authService.findOne({ account: accountId, token })
    const account = await accountService.findOne({ id: accountId })
    if (authRecord && account) {
      request.account = account
      request.role = account.role
    }
  }
  request.role ??= AccountRole.GUEST
  next()
}

export function requireAuth(request: Request, _response: Response, next: NextFunction) {
  if (request.role !== AccountRole.GUEST) {
    return next()
  }
  throw createError(401, 'error.no-permission')
}
