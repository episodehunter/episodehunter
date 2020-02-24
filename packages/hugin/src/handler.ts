import { createGuard } from '@episodehunter/kingsguard';
import { TrackEvent } from '@episodehunter/logger';
import { APIGatewayProxyEvent } from 'aws-lambda';

const config = {
  sentryDsn: process.env.AWS_SENTRY_DSN,
  logdnaKey: process.env.LOGDNA_KEY,
  trackingId: process.env.GA_TRACKING_ID
};

const gard = createGuard(config.sentryDsn, config.logdnaKey, config.trackingId);

export const handler = gard<APIGatewayProxyEvent>(async (event, logger) => {
  const eventToTrack = parseJson<TrackEvent>(event.body);
  if (!eventToTrack) {
    return createOkResponse('Missing event');
  }
  eventToTrack.userAgent = event.headers['User-Agent'];

  await logger.track(eventToTrack);
  return createOkResponse('OK');
});

export function parseJson<T = unknown>(jsonStr: string | null): T | null {
  if (!jsonStr) {
    return null;
  }
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    return null;
  }
}

export const createOkResponse = (message: string) => ({
  statusCode: '200',
  headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
  body: JSON.stringify({ message })
});
