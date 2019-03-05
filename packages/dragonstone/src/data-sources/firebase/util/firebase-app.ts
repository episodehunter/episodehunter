import admin from "firebase-admin";
import { config } from "../../../config";

export const createFirebase = () => {
  const app = admin.initializeApp(config.firebaseKey);

  const firestore = app.firestore();

  const auth = app.auth();

  return { firestore, auth };
}
