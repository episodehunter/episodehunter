export const config = {
  sentryDsn: process.env.AWS_SENTRY_DSN,
  logdnaKey: process.env.LOGDNA_KEY,
  dragonstoneApiKey: process.env.DRAGONSTONE_API_KEY,
  dragonstoneUrl: process.env.DRAGONSTONE_URL,
  redKeepApiKey: process.env.EH_RED_KEEP_API_KEY,
  ehRedKeepUrl: process.env.EH_RED_KEEP_URL,
  theTvDbApiKey: process.env.THE_TV_DB_API_KEY,
  snsUpdateShow: process.env.EH_SNS_UPDATE_SHOW,
  addShowDragonstoneFunctionName: process.env.ADD_SHOW_DRAGONSTONE_FUNCTION_NAME,
  updateShowDragonstoneFunctionName: process.env.UPDATE_SHOW_DRAGONSTONE_FUNCTION_NAME
};
