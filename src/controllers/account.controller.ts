import { Request, Response, NextFunction } from 'express'
import { MultipleItemResponse, SingleItemResponse } from '../interfaces/response.interface'
import { Account } from '../interfaces/account.interface'
import AccountService from '../services/account.service'

export class AccountController {
  private accountService = new AccountService()

  public getAccounts = async (request: Request, response: Response<MultipleItemResponse<Account>>, next: NextFunction) => {
    try {
      const items = await this.accountService.search()
      response.status(200).json({ success: true, counts: 0, items: [] })
    } catch (error) {
      next(error)
    }
  }

  public createAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    const item = await this.accountService.insertOne(request.body)

    // TODO: insert claim (request.permissionClaimBuilder)
    response.status(201).json({ success: true, item })
  }

  public updateAccount = async (request: Request, response: Response<SingleItemResponse<Account>>, next: NextFunction) => {
    const item = await this.accountService.updateOne({id: request.params.id})
  }
}
