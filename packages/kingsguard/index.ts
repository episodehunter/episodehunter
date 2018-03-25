import { Logger } from '@episodehunter/logger'
import { Context } from 'aws-lambda'
import { assertRequiredConfigImp, guardImp } from './guard'

const assertRequiredConfig = assertRequiredConfigImp()

assertRequiredConfig('EH_RAVEN_DSN', 'EH_RAVEN_PROJECT', 'LOGDNA_KEY')

const guard = guardImp(Logger, process.env)
export { assertRequiredConfig, guard, Logger, Context }
