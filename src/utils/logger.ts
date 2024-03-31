import pino from 'pino'

const logger = pino({
  level: 'info',
  formatters: {
    // we do not want to expose pid and host
    bindings() {
      return {}
    }
  }
})

export default logger
