import { Logger as EhLogger } from '@episodehunter/logger'
import { connect, Connection } from '@episodehunter/datastore'
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

function isConnection(con: Connection | null): con is Connection {
  return Boolean(con && 'close' in con && typeof con.close === 'function')
}

export function guardImp(Logger: any, connectToDb: typeof connect, envVars = process.env) {
  return function guard<T>(
    fun: (event: T, logger: EhLogger, connect: () => Promise<Connection>, context: Context) => any
  ) {
    return async (event: T, context: Context, callback: Callback) => {
      const logger: EhLogger = new Logger(envVars.EH_RAVEN_DSN as string, envVars.EH_RAVEN_PROJECT as string)
      logger.install(context)
      let connection: Connection | null = null
      const connect = async () => {
        connection = await connectToDb({
          database: envVars.EH_DB_DATABASE as string,
          host: envVars.EH_DB_HOST as string,
          password: envVars.EH_DB_PASSWORD as string,
          port: Number(envVars.EH_DB_PORT),
          username: envVars.EH_DB_USERNAME as string,
          logger,
          consoleAllQuerys: false
        })
        return connection
      }

      const timeoutId = setTimeout(() => {
        logger.captureException(new Error(`Timeout in 500ms for ${context.functionName}`))
      }, context.getRemainingTimeInMillis() - 500)
      try {
        const result = await fun(event, logger, connect, context)
        callback(undefined, result)
      } catch (error) {
        logger.captureException(error)
        callback(error)
      } finally {
        clearTimeout(timeoutId)
        if (isConnection(connection)) {
          connection.close()
        }
      }
    }
  }
}
