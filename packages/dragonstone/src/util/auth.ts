import { IncomingHttpHeaders } from 'http';
import firebase from 'firebase-admin';
import { config } from '../config';

function getUserId(
  auth: firebase.auth.Auth,
  token: string | null
): Promise<string | null> {
  if (!token) {
    return Promise.resolve(null);
  }
  return auth
    .verifyIdToken(token)
    .then(r => r.uid || r.user_id || r.sub || null)
    .catch(e => null);
}

export function getToken(headers: IncomingHttpHeaders): string | null {
  if (headers && headers.authorization) {
    return headers.authorization.split(' ')[1];
  }
  return null;
}

export function getUidFromHeader(
  auth: firebase.auth.Auth,
  headers: IncomingHttpHeaders
) {
  const token = getToken(headers);
  if (config.develop) {
    return Promise.resolve(isNaN(Number(token)) ? null : token);
  } else {
    return getUserId(auth, token);
  }
}
