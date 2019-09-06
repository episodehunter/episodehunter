import { IncomingHttpHeaders } from 'http';
import firebase from 'firebase-admin';
import { config } from '../config';

function getFirebaseUserId(auth: firebase.auth.Auth, token: string | null): Promise<string | null> {
  if (!token) {
    return Promise.resolve(null);
  }
  return auth
    .verifyIdToken(token)
    .then(r => r.uid || r.user_id || r.sub || null)
    .catch(e => console.log(e));
}

export function getToken(headers: IncomingHttpHeaders): string | null {
  if (typeof headers.Authorization === 'string') {
    return headers.Authorization.split(' ')[1];
  } else if (typeof headers.authorization === 'string') {
    return headers.authorization.split(' ')[1];
  }
  return null;
}

export async function getFirebaseUidFromHeader(auth: firebase.auth.Auth, headers: IncomingHttpHeaders): Promise<string | null> {
  const token = getToken(headers);
  if (config.develop) {
    if (!token) {
      return null;
    } else if (isNaN(Number(token))) {
      return getFirebaseUserId(auth, token);
    } else {
      return token;
    }
  } else {
    return getFirebaseUserId(auth, token);
  }
}
