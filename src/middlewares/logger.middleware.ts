import logger from '../utils/logger'
import { pinoHttp } from 'pino-http'
import pino from 'pino'

export const loggerMiddleware = pinoHttp({
  logger,
  serializers: {
    req: (req) => ({
      id: req.id,
      method: req.method,
      url: req.url
    }),
    res: (res) => ({
      statusCode: res.statusCode
    })
  },
  customLogLevel: function (_req, res, err) {
    if (res.statusCode >= 300 && res.statusCode < 500) {
      return 'silent'
    } else if (res.statusCode >= 500 || err) {
      return 'error'
    }
    return 'info'
  }
})
