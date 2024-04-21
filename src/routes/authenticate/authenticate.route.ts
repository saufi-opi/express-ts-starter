import { Router } from 'express'
import { Routes } from '../../interfaces/route.interface'
import { AuthenticateController } from './authenticate.controller'

export class AuthenticateRoute implements Routes {
  public path = '/authenticate'
  public router = Router()
  private ctr = new AuthenticateController()

  constructor() {
    this.initializeRoutes()
  }

  public initializeRoutes() {
    this.router.post(this.path, this.ctr.login)
    this.router.delete(this.path, this.ctr.logout)
  }
}
