import { Request, Response } from 'express'
import logger from '../utils/logger'
import { pinoHttp } from 'pino-http'

export const loggerMiddleware = pinoHttp({
  logger,
  serializers: {
    req: (request: Request) => ({
      id: request.id,
      method: request.method,
      url: request.url
    }),
    res: (response: Response) => ({
      statusCode: response.statusCode
    })
  },
  customLogLevel: function (_, response, err) {
    if (response.statusCode >= 300 && response.statusCode < 500) {
      return 'silent'
    } else if (response.statusCode >= 500 || err) {
      return 'error'
    }
    return 'info'
  }
})
