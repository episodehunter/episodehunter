import { setupLogger, Logger } from '@episodehunter/logger'
import { Context, Callback } from 'aws-lambda'

type EventType = { [key: string]: any }

function createGuard(ravenDsn?: string, logdnaKey?: string, _setupLogger = setupLogger) {
  const createLogger = _setupLogger(ravenDsn, logdnaKey)
  return function guard<T extends EventType>(
    fun: (event: T, logger: Logger, context: Context) => any
  ) {
    return async (event: T | string, context: Context, callback: Callback) => {
      let parsedEvent!: T
      try {
        parsedEvent = parseEvent(event);
      } catch (error) {
        return callback(error)
      }
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

      try {
        callback(undefined, await fun(parsedEvent, logger, context))
      } catch (error) {
        logger.captureException(error)
        callback(error)
      } finally {
        clearTimeout(timeoutId)
      }
    }
  }
}

function parseEvent<T>(event: T | string): T {
  if (typeof event === 'string') {
    try {
      return JSON.parse(event);
    } catch (error) {
      console.error('Could not parse ' + event);
      throw error;
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
