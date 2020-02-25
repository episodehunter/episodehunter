interface Config {
  firebase: {
    serviceAccount?: any;
    projectId: string;
  };
  engineApiKey?: string;
  logdnaKey?: string;
  sentryDns?: string;
  develop: boolean;
  pgConnectionUri: string;
  trackId: string;
}

function createProductionConfig(): Config {
  if (!process.env.FIREBASE_KEY) {
    throw new Error('FIREBASE_KEY is missing!');
  } else if (!process.env.ENGINE_API_KEY) {
    throw new Error('ENGINE_API_KEY is missing!');
  } else if (!process.env.LOGDNA_KEY) {
    throw new Error('LOGDNA_KEY is missing!');
  } else if (!process.env.AWS_SENTRY_DSN) {
    throw new Error('AWS_SENTRY_DSN is missing!');
  } else if (!process.env.PG_CONNECTION_URI) {
    throw new Error('PG_CONNECTION_URI is missing!');
  } else if (!process.env.GA_TRACKING_ID) {
    throw new Error('GA_TRACKING_ID is missing!');
  }

  const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_KEY, 'base64').toString());
  return {
    firebase: {
      serviceAccount,
      projectId: 'newagent-dc3d1'
    },
    engineApiKey: process.env.ENGINE_API_KEY,
    logdnaKey: process.env.LOGDNA_KEY,
    sentryDns: process.env.AWS_SENTRY_DSN,
    develop: false,
    pgConnectionUri: process.env.PG_CONNECTION_URI,
    trackId: process.env.GA_TRACKING_ID
  };
}

function createDevelopConfig(): Config {
  return {
    firebase: { projectId: 'newagent-dc3d1' },
    engineApiKey: process.env.ENGINE_API_KEY,
    logdnaKey: process.env.LOGDNA_KEY,
    sentryDns: process.env.AWS_SENTRY_DSN,
    develop: true,
    pgConnectionUri: process.env.PG_CONNECTION_URI || 'postgresql://user:123@localhost:3211/episodehunter-test',
    trackId: ''
  };
}

function createConfig(): Config {
  if (process.env.NODE_ENV === 'develop' || process.env.NODE_ENV === 'test') {
    return createDevelopConfig();
  }
  return createProductionConfig();
}

export const config: Config = createConfig();
