import { Logger } from '@episodehunter/logger';
import { assertRequiredConfig } from './util';

assertRequiredConfig('EH_RAVEN_DSN', 'EH_RAVEN_PROJECT');

export const logger = new Logger(process.env.EH_RAVEN_DSN, process.env.EH_RAVEN_PROJECT);
