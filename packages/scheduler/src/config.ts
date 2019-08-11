function assertEnv() {
  ['AWS_SENTRY_DSN', 'LOGDNA_KEY', 'DRAGONSTONE_URL', 'EH_SNS_UPDATE_SHOW', 'THE_TV_DB_API_KEY'].forEach(env => {
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
    sentryDns: process.env.AWS_SENTRY_DSN!,
    logdnaKey: process.env.LOGDNA_KEY!,
    dragonstoneUrl: process.env.DRAGONSTONE_URL!,
    updateShowQueueName: process.env.EH_SNS_UPDATE_SHOW!,
    theTvDbApiKey: process.env.THE_TV_DB_API_KEY!
  };
}

export const config = createConfig();
