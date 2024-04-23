import { Request, Response, NextFunction } from 'express'
import AuthenticateService from './authenticate.service'
import AccountService from '../account/account.service'
import { JwtPayload, verify } from 'jsonwebtoken'
import { JWT_SECRET, TOKEN_EXP } from '../../config'
import { createToken, findTokenFromHeader } from './authenticate.helper'

export class AuthenticateController {
  private service = {
    auth: AuthenticateService,
    account: AccountService
  }

  public login = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { email, password } = request.body
      let account = await this.service.account.findOne({ email })
      const isValidPassword = account?.password === this.service.account.hashedPassword(password)
      if (!isValidPassword) throw this.service.auth.error(400, 'invalid-credentials')

      account = await this.service.account.findOne({ email }, { projection: '-password' })
      const { token, exp } = await createToken({ account: account.id, expiresIn: TOKEN_EXP })

      const existingRecord = await this.service.auth.findOne({ account: account.id })
      if (existingRecord) {
        await this.service.auth.updateOne({ account: account.id }, { exp, token })
      } else {
        await this.service.auth.insertOne({ account: account.id, exp, token })
      }
      response.status(200).json({ success: true, token, item: account })
    } catch (error) {
      next(error)
    }
  }

  public logout = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const token = findTokenFromHeader(request)
      const payload = verify(token, JWT_SECRET) as JwtPayload
      await this.service.auth.deleteMany({ account: payload.account })

      response.status(200).json({ success: true })
    } catch (error) {
      next(error)
    }
  }
}
