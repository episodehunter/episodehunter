interface Config {
  sentryDsn: string;
  logdnaKey: string;
  theTvDbApiKey: string;
  tmdbApiKey: string;
  snsUpdateShow: string;
  addShowDragonstoneFunctionName: string;
  updateShowDragonstoneFunctionName: string;
  updateShowMetadataDragonstoneFunctionName: string;
  updateEpisodesDragonstoneFunctionName: string;
}

function createProdConfig(): Config {
  return {
    sentryDsn: process.env.AWS_SENTRY_DSN!,
    logdnaKey: process.env.LOGDNA_KEY!,
    theTvDbApiKey: process.env.THE_TV_DB_API_KEY!,
    tmdbApiKey: process.env.TMDB_API_KEY!,
    snsUpdateShow: process.env.EH_SNS_UPDATE_SHOW!,
    addShowDragonstoneFunctionName: process.env.ADD_SHOW_DRAGONSTONE_FUNCTION_NAME!,
    updateShowDragonstoneFunctionName: process.env.UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME!,
    updateShowMetadataDragonstoneFunctionName: process.env.UPDATE_SHOW_METADATA_DRAGONSTONE_FUNCTION_NAME!,
    updateEpisodesDragonstoneFunctionName: process.env.UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME!
  };
}

function createTestConfig() {
  return {
    sentryDsn: 'sentry-dsn',
    logdnaKey: 'LOGDNA_KEY',
    theTvDbApiKey: 'THE_TV_DB_API_KEY',
    tmdbApiKey: 'THE_TV_DB_API_KEY',
    snsUpdateShow: 'EH_SNS_UPDATE_SHOW',
    addShowDragonstoneFunctionName: 'ADD_SHOW_DRAGONSTONE_FUNCTION_NAME',
    updateShowDragonstoneFunctionName: 'UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME',
    updateShowMetadataDragonstoneFunctionName: 'UPDATE_SHOW_METADATA_DRAGONSTONE_FUNCTION_NAME',
    updateEpisodesDragonstoneFunctionName: 'UPDATE_EPISODES_DRAGONSTONE_FUNCTION_NAME'
  };
}

export const config = process.env.NODE_ENV === 'test' ? createTestConfig() : createProdConfig();
