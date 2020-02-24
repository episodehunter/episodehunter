function assertEnv() {
  ['AWS_SENTRY_DSN', 'LOGDNA_KEY', 'EH_SNS_UPDATE_SHOW', 'NEXT_TO_UPDATE_DRAGONSTONE_FUNCTION_NAME', 'GA_TRACKING_ID'].forEach(
    env => {
      if (!process.env[env]) {
        throw new Error('Can not read process.env.' + env);
      }
    }
  );
}

function createConfig() {
  if (process.env.NODE_ENV !== 'test') {
    assertEnv();
  }
  return {
    trackingId: process.env.GA_TRACKING_ID!,
    sentryDns: process.env.AWS_SENTRY_DSN!,
    logdnaKey: process.env.LOGDNA_KEY!,
    updateShowQueueName: process.env.EH_SNS_UPDATE_SHOW!,
    nextToUpdateFunctionName: process.env.NEXT_TO_UPDATE_DRAGONSTONE_FUNCTION_NAME!
  };
}

export const config = createConfig();
