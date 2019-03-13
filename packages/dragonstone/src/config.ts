interface Config {
  firebase: {
    serviceAccount?: any;
    projectId: string;
  };
  engineApiKey: string;
  logdnaKey: string;
  ravenDns: string;
  develop: boolean;
}

function createProductionConfig(): Config {
  if (!process.env.FIREBASE_KEY) {
    throw new Error('FIREBASE_KEY is missing!');
  } else if (!process.env.ENGINE_API_KEY) {
    throw new Error('ENGINE_API_KEY is missing!');
  } else if (!process.env.LOGDNA_KEY) {
    throw new Error('LOGDNA_KEY is missing!');
  } else if (!process.env.RAVEN_DNS) {
    throw new Error('RAVEN_DNS is missing!');
  }
  const serviceAccount = JSON.parse(Buffer.from(process.env.FIREBASE_KEY, 'base64').toString());
  return {
    firebase: {
      serviceAccount,
      projectId: 'newagent-dc3d1'
    },
    engineApiKey: process.env.ENGINE_API_KEY,
    logdnaKey: process.env.LOGDNA_KEY,
    ravenDns: process.env.RAVEN_DNS,
    develop: false
  };
}

function createDevelopConfig(): Config {
  if (!process.env.ENGINE_API_KEY) {
    throw new Error('ENGINE_API_KEY is missing!');
  } else if (!process.env.LOGDNA_KEY) {
    throw new Error('LOGDNA_KEY is missing!');
  } else if (!process.env.RAVEN_DNS) {
    throw new Error('RAVEN_DNS is missing!');
  }
  return {
    firebase: { projectId: 'newagent-dc3d1' },
    engineApiKey: process.env.ENGINE_API_KEY,
    logdnaKey: process.env.LOGDNA_KEY,
    ravenDns: process.env.RAVEN_DNS,
    develop: true
  };
}

function createConfig(): Config {
  if (process.env.NODE_ENV === 'develop') {
    return createDevelopConfig();
  }
  return createProductionConfig();
}

export const config: Config = createConfig();
