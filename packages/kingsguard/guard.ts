import { setupLogger, Logger } from '@episodehunter/logger'
import { Context, Callback } from 'aws-lambda'

function createGuard(ravenDsn?: string, logdnaKey?: string, _setupLogger = setupLogger) {
  const createLogger = _setupLogger(ravenDsn, logdnaKey)
  return function guard<T extends { requestStack?: string[]; headers?: { [key: string]: string } }>(
    fun: (event: T, logger: Logger, context: Context) => any
  ) {
    return async (event: T, context: Context, callback: Callback) => {
      let requestStack: string[] | undefined
      if (event && event.headers) {
        requestStack = extractRequestStackFromHeader(event)
      } else if (event && event.requestStack) {
        requestStack = event.requestStack
      }
      const logger = createLogger(context, requestStack)

      const timeoutId = setTimeout(() => {
        logger.captureException(new Error(`Timeout in 500ms for ${context.functionName}`))
      }, context.getRemainingTimeInMillis() - 500)

      try {
        callback(undefined, await fun(event, logger, context))
      } catch (error) {
        logger.captureException(error)
        callback(error)
      } finally {
        clearTimeout(timeoutId)
      }
    }
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
