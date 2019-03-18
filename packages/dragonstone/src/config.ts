interface Config {
  firebase: {
    serviceAccount?: any;
    projectId: string;
  };
  engineApiKey?: string;
  logdnaKey?: string;
  sentryDns?: string;
  dragonstoneApiKey: string;
  develop: boolean;
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
  } else if (!process.env.DRAGONSTONE_API_KEY) {
    throw new Error('DRAGONSTONE_API_KEY is missing!');
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
    dragonstoneApiKey: process.env.DRAGONSTONE_API_KEY
  };
}

function createDevelopConfig(): Config {
  return {
    firebase: { projectId: 'newagent-dc3d1' },
    engineApiKey: process.env.ENGINE_API_KEY,
    logdnaKey: process.env.LOGDNA_KEY,
    sentryDns: process.env.AWS_SENTRY_DSN,
    develop: true,
    dragonstoneApiKey: 'dragonstone-api-key'
  };
}

function createConfig(): Config {
  if (process.env.NODE_ENV === 'develop') {
    return createDevelopConfig();
  }
  return createProductionConfig();
}

export const config: Config = createConfig();
