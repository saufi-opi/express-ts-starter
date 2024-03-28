import express from "express"
import { permissionClaimBuilderMiddleware } from "./middlewares/permission.middleware"
import { authMiddleware } from "./middlewares/auth.middleware"
import mongoose from "mongoose"
import { MONGODB_DB_NAME, MONGODB_URL, PORT } from "./config"
import { errorMiddleware } from "./middlewares/error.middleware"
import { notFoundHandlerMiddleware } from "./middlewares/404.middleware"

class App {
  private app: express.Application
  private port: number
  private prefix: string

  constructor(routes: any[]) {
    this.app = express()
    this.port = PORT
    this.prefix = "/api/v1"

    this.initializedMiddlewares()
    this.connectDatabase()
    this.initializeRoutes(routes)

    // error
    this.initializeNotFoundHandler()
    this.initializeErrorHandler()
  }

  public listen() {
    this.app.listen(this.port, () => {
      console.log(`🚀 Server listening at http://localhost:${this.port}`)
    })
  }

  private async connectDatabase() {
    try {
      await mongoose.connect(MONGODB_URL, { dbName: MONGODB_DB_NAME })
      console.log("✅ Database connected")
    } catch (error) {
      console.log("❌ Database connection failed")
    }
  }

  private initializeRoutes(routes: any[]) {
    routes.forEach((route) => {
      this.app.use(`${this.prefix}/`, route.router)
    })
  }

  private initializedMiddlewares() {
    this.app.post("*", permissionClaimBuilderMiddleware)
    this.app.use(authMiddleware)
  }

  private initializeNotFoundHandler() {
    this.app.use(notFoundHandlerMiddleware)
  }

  private initializeErrorHandler() {
    this.app.use(errorMiddleware)
  }
}

export default App
