function createConfig() {
  return {
    bucketName: process.env.BUCKET_NAME!,
    bucketUrl: process.env.BUCKET_URL!,
    theTvDbApiKey: process.env.THE_TV_DB_API_KEY!,
    sentryDsn: process.env.AWS_SENTRY_DSN!,
    logdnaKey: process.env.LOGDNA_KEY
  };
}

export const config = createConfig();
