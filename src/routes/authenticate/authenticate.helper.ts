import { Request } from 'express'
import { JWT_SECRET } from '../../config'
import { JwtPayload, sign, verify } from 'jsonwebtoken'
import { AccountRole } from '../account/account.model'

interface CreateTokenOption {
  account: string
  expiresIn: string
}

export function findTokenFromHeader(request: Request) {
  const authorization = request.headers.authorization
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.replace('Bearer ', '')
  }
  return ''
}

export async function createToken(options: CreateTokenOption) {
  const { account, expiresIn } = options
  const token = sign({ account }, JWT_SECRET, { expiresIn, audience: '*', subject: account })
  const { exp } = verify(token, JWT_SECRET) as JwtPayload
  return { token, exp: new Date(Number(exp) * 1000) }
}

export function getAccountIdFromToken(token: string) {
  try {
    const payload = verify(token, JWT_SECRET) as JwtPayload
    const account = payload.account
    return account
  } catch (error) {
    return AccountRole.GUEST
  }
}
