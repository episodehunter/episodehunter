import { TheTvDb } from '@episodehunter/thetvdb';
import { config } from './config';

export const theTvDb = new TheTvDb(config.theTvDbApiKey);
