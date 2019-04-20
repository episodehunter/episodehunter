interface Config {
  sentryDsn: string;
  logdnaKey: string;
  dragonstoneApiKey: string;
  dragonstoneUrl: string;
  redKeepApiKey: string;
  ehRedKeepUrl: string;
  theTvDbApiKey: string;
  snsUpdateShow: string;
  addShowDragonstoneFunctionName: string;
  updateShowDragonstoneFunctionName: string;
  updateEpisodesDragonstoneFunctionName: string;
}

function createProdConfig(): Config {
  return {
    sentryDsn: process.env.AWS_SENTRY_DSN,
    logdnaKey: process.env.LOGDNA_KEY,
    dragonstoneApiKey: process.env.DRAGONSTONE_API_KEY,
    dragonstoneUrl: process.env.DRAGONSTONE_URL,
    redKeepApiKey: process.env.EH_RED_KEEP_API_KEY,
    ehRedKeepUrl: process.env.EH_RED_KEEP_URL,
    theTvDbApiKey: process.env.THE_TV_DB_API_KEY,
    snsUpdateShow: process.env.EH_SNS_UPDATE_SHOW,
    addShowDragonstoneFunctionName: process.env.ADD_SHOW_DRAGONSTONE_FUNCTION_NAME,
    updateShowDragonstoneFunctionName: process.env.UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME,
    updateEpisodesDragonstoneFunctionName: process.env.UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME
  };
}

function createTestConfig() {
  return {
    sentryDsn: 'sentry-dsn',
    logdnaKey: 'LOGDNA_KEY',
    dragonstoneApiKey: 'DRAGONSTONE_API_KEY',
    dragonstoneUrl: 'DRAGONSTONE_URL',
    redKeepApiKey: 'EH_RED_KEEP_API_KEY',
    ehRedKeepUrl: 'EH_RED_KEEP_URL',
    theTvDbApiKey: 'THE_TV_DB_API_KEY',
    snsUpdateShow: 'EH_SNS_UPDATE_SHOW',
    addShowDragonstoneFunctionName: 'ADD_SHOW_DRAGONSTONE_FUNCTION_NAME',
    updateShowDragonstoneFunctionName: 'UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME',
    updateEpisodesDragonstoneFunctionName: 'UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME'
  };
}

export const config = process.env.NODE_ENV === 'test' ? createTestConfig() : createProdConfig();
