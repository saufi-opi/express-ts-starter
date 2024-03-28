import { Router, Request, Response } from 'express'
import { Routes } from '../interfaces/route.interface'

class HealthCheckRoute implements Routes {
  public path = '/'
  public router = Router()

  constructor() {
    this.initializeRoutes()
  }

  private initializeRoutes() {
    this.router.get(`${this.path}`, (_request: Request, response: Response<{ success: boolean; message: string }>) => {
      response.status(201).json({ success: true, message: 'OK' })
    })
  }
}

export default HealthCheckRoute
