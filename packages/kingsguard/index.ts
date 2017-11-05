import { Logger } from '@episodehunter/logger'
import { connect, Connection, entities } from '@episodehunter/datastore'
import { Context } from 'aws-lambda'
import { assertRequiredConfigImp, guardImp } from './guard'

const assertRequiredConfig = assertRequiredConfigImp()

assertRequiredConfig(
  'EH_DB_HOST',
  'EH_DB_PORT',
  'EH_DB_USERNAME',
  'EH_DB_PASSWORD',
  'EH_DB_DATABASE',
  'EH_RAVEN_DSN',
  'EH_RAVEN_PROJECT'
)

const guard = guardImp(Logger, connect, process.env)
export { assertRequiredConfig, guard, Connection, entities, Logger, Context }
