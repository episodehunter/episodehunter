import admin, { AppOptions } from 'firebase-admin';
import { config } from '../config';

export const createFirebase = () => {
  const fbConfig: AppOptions = {
    projectId: config.firebase.projectId
  };
  if (config.firebase.serviceAccount) {
    fbConfig.credential = admin.credential.cert(config.firebase.serviceAccount);
  }
  const app = admin.initializeApp(fbConfig);

  const firestore = app.firestore();

  const auth = app.auth();

  return { firestore, auth };
};
