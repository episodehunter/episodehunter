interface Config {
  firebase: {
    serviceAccount?: any;
    projectId: string;
  };
  develop: boolean;
}

function createProductionConfig(): Config {
  if (!process.env.FIREBASE_KEY) {
    throw new Error('FIREBASE_KEY is missing!');
  }
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_KEY, 'base64').toString()
  );
  return {
    firebase: {
      serviceAccount,
      projectId: 'newagent-dc3d1'
    },
    develop: false
  };
}

function createDevelopConfig(): Config {
  return {
    firebase: { projectId: 'newagent-dc3d1' },
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
