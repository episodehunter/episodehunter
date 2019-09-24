import { setupLogger, Logger } from '@episodehunter/logger'
import { Context } from 'aws-lambda'

type EventType = { [key: string]: any }

function createGuard(ravenDsn?: string, logdnaKey?: string, _setupLogger = setupLogger) {
  const createLogger = _setupLogger(ravenDsn, logdnaKey)
  return function guard<T extends EventType>(
    fun: (event: T, logger: Logger, context: Context) => Promise<unknown>
  ) {
    return async (event: T | string, context: Context) => {
      const parsedEvent = parseEvent(event)

      let requestStack: string[] | undefined
      if (parsedEvent && parsedEvent.headers) {
        requestStack = extractRequestStackFromHeader(parsedEvent)
      } else if (event && parsedEvent.requestStack) {
        requestStack = parsedEvent.requestStack
      }
      const logger = createLogger(context, requestStack)

      const timeoutId = setTimeout(() => {
        logger.captureException(new Error(`Timeout in 500ms for ${context.functionName}`))
      }, context.getRemainingTimeInMillis() - 500)

      return fun(parsedEvent, logger, context)
        .then(result => {
          clearTimeout(timeoutId)
          logger.flush()
          return result
        })
        .catch(error => {
          clearTimeout(timeoutId)
          logger.captureException(error)
          logger.flush()
          return Promise.reject(error)
        })
    }
  }
}

function parseEvent<T>(event: T | string): T {
  if (typeof event === 'string') {
    try {
      return JSON.parse(event)
    } catch (error) {
      console.error('Could not parse ' + event)
      throw error
    }
  } else {
    return event
  }
}

function extractRequestStackFromHeader(event: { headers?: { [key: string]: string } }): string[] | undefined {
  if (!event.headers) {
    return
  }
  const requestStack = event.headers['x-request-stack'] || ''
  return requestStack.split(',')
}

export { Logger, createGuard }
