import { Router } from 'express'
import { Routes } from '../../interfaces/route.interface'
import { AccountController } from './account.controller'

class AccountRoute implements Routes {
  public path = '/accounts'
  public router = Router()
  private ctr = new AccountController()

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.get(this.path, this.ctr.getAccounts)
    this.router.post(this.path, this.ctr.createAccount)
    this.router.get(`${this.path}/:id`, this.ctr.getAccount)
    this.router.put(`${this.path}/:id`, this.ctr.updateAccount)
    this.router.delete(`${this.path}/:id`, this.ctr.deleteAccount)
  }
}

export default AccountRoute
