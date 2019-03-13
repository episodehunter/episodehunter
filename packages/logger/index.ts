import { Context } from 'aws-lambda';
import * as DnaLogger from 'logdna';
import * as Sentry from '@sentry/node';

interface DnaLogger {
  log: (
    message: string,
    opt: { level: 'Debug' | 'Trace' | 'Info' | 'Warn' | 'Error' | 'Fatal'; meta: any }
  ) => void;
}

export function setupLogger(ravenDns: string, logDnaApiKey: string) {
  installSentry(ravenDns);
  const dnaLogger = installLogdna(logDnaApiKey);
  return createCreateSentryLogger(dnaLogger);
}

function createCreateSentryLogger(logdna: DnaLogger) {
  return (context: Context, requestStack?: string[]) => {
    const meta = {
      functionName: context.functionName,
      functionVersion: context.functionVersion,
      requestId: context.awsRequestId,
      logGroupName: context.logGroupName,
      logStreamName: context.logStreamName,
      requestStack
    };
    const log = (message: string) => {
      console.log(message);
      Sentry.addBreadcrumb({
        level: Sentry.Severity.Log,
        message,
        data: meta
      });
      logdna.log(message, { level: 'Info', meta });
    };
    const warn = (message: string) => {
      console.warn(message);
      Sentry.addBreadcrumb({
        level: Sentry.Severity.Warning,
        message,
        data: meta
      });
      logdna.log(message, { level: 'Warn', meta });
    };
    const captureBreadcrumb = (message: string, category: string, data?: object) => {
      console.log(message, category, data);
      Sentry.addBreadcrumb({
        level: Sentry.Severity.Warning,
        message,
        category,
        data: Object.assign({}, meta, data)
      });
      logdna.log(message, { level: 'Error', meta });
    };
    const captureException = (error: Error & { awsRequestId?: string }) => {
      error.awsRequestId = context.awsRequestId;
      console.log(error);
      Sentry.captureException(error);
      try {
        const logmsg = error.message + ' at ' + error.stack;
        logdna.log(logmsg, { level: 'Fatal', meta });
      } catch (error) {
        logdna.log('Could not parse error message', { level: 'Fatal', meta });
      }
      DnaLogger.flushAll();
    };
    const eventStart = (message: string, category = 'event') => {
      const startMsg = `[START] ${message}. Remaning time ${context.getRemainingTimeInMillis()}ms`;
      captureBreadcrumb(startMsg, 'Start ' + category);
      const startTime = process.hrtime();
      return () => {
        const endTime = process.hrtime(startTime);
        const totalTime = endTime[0] * 1000 + endTime[1] / 1000000;
        const endMsg = `[END] ${message}. Time elapsed: ${totalTime}ms. Remaning time ${context.getRemainingTimeInMillis()}ms`;
        console.log(endMsg);
        captureBreadcrumb(
          `[END] ${message}. Time elapsed: ${totalTime}ms. Remaning time ${context.getRemainingTimeInMillis()}ms`,
          'End ' + category
        );
      };
    };

    return { log, warn, captureBreadcrumb, captureException, eventStart };
  };
}

function installSentry(ravenDns: string) {
  Sentry.init({
    dns: ravenDns,
    environment: process.env.NODE_ENV === 'develop' ? 'develop' : 'production'
  });
}

function installLogdna(logDnaApiKey: string) {
  return DnaLogger.setupDefaultLogger(logDnaApiKey, {
    env: process.env.NODE_ENV === 'develop' ? 'develop' : 'production',
    index_meta: true
  });
}
