import { Router } from 'express'
import { Routes } from '../interfaces/route.interface'
import { AccountController } from '../controllers/account.controller'

class AccountRoute implements Routes {
  public path = '/accounts'
  public router = Router()
  private ctr = new AccountController()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(this.path, this.ctr.getAccounts)
    this.router.post(this.path, this.ctr.createAccount)
    this.router.put(this.path, this.ctr.updateAccount)
  }
}

export default AccountRoute
