function assertEnv() {
  [
    'AWS_SENTRY_DSN',
    'LOGDNA_KEY',
    'RED_KEEP_API_KEY',
    'RED_KEEP_URL',
    'DRAGONSTONE_URL',
    'DRAGONSTONE_API_KEY',
    'EH_SNS_UPDATE_SHOW',
    'THE_TV_DB_API_KEY'
  ].forEach(env => {
    if (!process.env[env]) {
      throw new Error('Can not read process.env.' + env);
    }
  });
}

function createConfig() {
  if (process.env.NODE_ENV !== 'test') {
    assertEnv();
  }
  return {
    sentryDns: process.env.AWS_SENTRY_DSN,
    logdnaKey: process.env.LOGDNA_KEY,
    redKeepApiKey: process.env.RED_KEEP_API_KEY,
    redKeepUrl: process.env.RED_KEEP_URL,
    dragonstoneUrl: process.env.DRAGONSTONE_URL,
    dragonstoneApiKey: process.env.DRAGONSTONE_API_KEY,
    updateShowQueueName: process.env.EH_SNS_UPDATE_SHOW,
    updateShowTopic: process.env.SNS_UPDATE_SHOW_TOPIC,
    theTvDbApiKey: process.env.THE_TV_DB_API_KEY
  };
}

export const config = createConfig();
