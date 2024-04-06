import { Request, Response, NextFunction } from 'express'
import { MultipleItemResponse, SingleItemResponse } from '../interfaces/response.interface'
import { Account } from '../models/account.model'
import AccountService from '../services/account.service'
import { withTransaction } from '../utils/database'
import databaseNames from '../databases/database.names'
import { AccountModel } from '../models/account.model'

export class AccountController {
  private accountService = new AccountService(AccountModel, { dbName: databaseNames.account })

  public getAccounts = async (request: Request, response: Response<MultipleItemResponse<Account>>, next: NextFunction) => {
    // TODO: retrieve query options from request url
    try {
      const items = await this.accountService.search({})
      response.status(200).json({ success: true, counts: items.length, items })
    } catch (error) {
      next(error)
    }
  }

  public createAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    try {
      const item = await withTransaction(async (session) => {
        const item = await this.accountService.insertOne(request.body, { session, projection: '-password' })
        return item
      })

      // TODO: insert claim (request.permissionClaimBuilder)
      response.status(201).json({ success: true, item })
    } catch (error) {
      next(error)
    }
  }

  public updateAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    // TODO: check permission for update this account id
    try {
      const item = await withTransaction(async (session) => {
        const item = await this.accountService.updateOne({ id: request.params.id }, request.body, { session, projection: '-password' })
        if (!item) throw this.accountService.error(404, 'id-not-exist')
        return item
      })

      response.status(200).json({ success: true, item })
    } catch (error) {
      next(error)
    }
  }

  public deleteAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    // TODO: check permission for delete this account id // or use middleware
    try {
      const item = await withTransaction(async (session) => {
        const item = await this.accountService.deleteOne({ id: request.params.id }, { session, projection: '-password' })
        if (!item) throw this.accountService.error(404, 'id-not-exist')
        return item
      })

      response.status(200).json({ success: true, item })
    } catch (error) {
      next(error)
    }
  }
}
