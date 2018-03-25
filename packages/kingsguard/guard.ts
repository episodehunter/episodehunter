import { Logger as EhLogger } from '@episodehunter/logger'
import { Context, Callback } from 'aws-lambda'

export function assertRequiredConfigImp(envVars = process.env) {
  return (...keys: string[]) => {
    keys.forEach(key => {
      if (!envVars[key]) {
        throw new Error(`Missing config for ${key}!`)
      }
    })
  }
}

export function guardImp(Logger: any, envVars = process.env) {
  return function guard<T>(fun: (event: T, logger: EhLogger, context: Context) => any) {
    return async (event: T, context: Context, callback: Callback) => {
      const logger: EhLogger = new Logger(envVars.EH_RAVEN_DSN, envVars.EH_RAVEN_PROJECT, envVars.LOGDNA_KEY)
      logger.install(context)

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
