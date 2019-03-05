function createProductionConfig() {
  if (!process.env.FIREBASE_KEY) {
    throw new Error('FIREBASE_KEY is missing!');
  }
  const firebaseKey = JSON.parse(Buffer.from(process.env.FIREBASE_KEY, 'base64').toString());
  return {
    firebaseKey
  }
}

function createDevelopConfig() {
  return {
    firebaseKey: { projectId: 'newagent-dc3d1' }
  }
}

function createConfig() {
  if (process.env.NODE_ENV === 'develop') {
    return createDevelopConfig();
  }
  return createProductionConfig();
}

export const config = createConfig();
