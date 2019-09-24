import { Context } from 'aws-lambda';
import * as dnaLogger from 'logdna';
import * as Sentry from '@sentry/node';

export interface Logger {
  log(message: string): void;
  warn(message: string): void;
  captureBreadcrumb(message: string, category: string, data?: object): void;
  captureException(error: Error & { awsRequestId?: string }): void;
  eventStart(message: string, category?: string): void;
  flush(): void;
}

export function setupLogger(
  ravenDns?: string,
  logDnaApiKey?: string
): (context: Context, requestStack?: string[]) => Logger {
  if (process.env.NODE_ENV === 'test') {
    return createTestLogger;
  }
  if (!ravenDns || !logDnaApiKey) {
    console.warn('Logger: Missing ravenDns and/or logDnaApiKey, using console only');
    return createLocalLogger;
  }
  installSentry(ravenDns);
  const dnaLogger = installLogdna(logDnaApiKey);
  return createCreateSentryLogger(dnaLogger);
}

function createCreateSentryLogger(logdna: dnaLogger.DnaLogger) {
  return (context: Context, requestStack: string[] = []): Logger => {
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
      logdna.log(message, { level: 'Info', meta, app: context.functionName });
    };
    const warn = (message: string) => {
      console.warn(message);
      Sentry.addBreadcrumb({
        level: Sentry.Severity.Warning,
        message,
        data: meta
      });
      logdna.log(message, { level: 'Warn', meta, app: context.functionName });
    };
    const captureBreadcrumb = (message: string, category: string, data?: object) => {
      const metaData = Object.assign({}, meta, data);
      Sentry.addBreadcrumb({
        level: Sentry.Severity.Warning,
        message,
        category,
        data: metaData
      });
      logdna.log(message, { level: 'Error', meta: metaData, app: context.functionName });
    };
    const captureException = (error: Error & { awsRequestId?: string, path?: string[] }) => {
      error.awsRequestId = context.awsRequestId;
      Sentry.captureException(error);
      const metaData = Object.assign({}, meta, { errorName: error.name, stack: error.stack, path: error.path })
      try {
        const logmsg = error.message + ' at ' + error.stack;
        logdna.log(logmsg, { level: 'Fatal', meta: metaData, app: context.functionName });
      } catch (error) {
        logdna.log('Could not parse error message', { level: 'Fatal', meta, app: context.functionName });
      }
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
        captureBreadcrumb(endMsg, 'End ' + category);
      };
    };
    const flush = () => {
      dnaLogger.flushAll();
    }

    return { flush, log, warn, captureBreadcrumb, captureException, eventStart };
  };
}

function createTestLogger(): Logger {
  return {
    log: () => {},
    warn: (message: string) => console.warn(message),
    captureBreadcrumb: () => {},
    captureException: (error: Error) => {
      console.error(error);
    },
    eventStart: () => {
      return () => {}
    },
    flush: () => {}
  }
}

function createLocalLogger(context: Context, requestStack: string[] = []): Logger {
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
  };
  const warn = (message: string) => {
    console.warn(message);
  };
  const captureBreadcrumb = (message: string, category: string, data?: object) => {
    console.log(message, category, data);
  };
  const captureException = (error: Error & { awsRequestId?: string, path: string[] }) => {
    error.awsRequestId = context.awsRequestId;
    const metaData = Object.assign({}, meta, { errorName: error.name, stack: error.stack, path: error.path })
    try {
      const logmsg = error.message + ' at ' + error.stack;
      console.error(logmsg, { level: 'Fatal', meta: metaData, app: context.functionName });
    } catch (error) {
      console.error('Could not parse error message', { level: 'Fatal', meta, app: context.functionName });
    }
  };
  const eventStart = (message: string, category = 'event') => {
    const startMsg = `[START] ${message}. Remaning time ${context.getRemainingTimeInMillis()}ms`;
    console.log(startMsg, 'Start ' + category);
    const startTime = process.hrtime();
    return () => {
      const endTime = process.hrtime(startTime);
      const totalTime = endTime[0] * 1000 + endTime[1] / 1000000;
      const endMsg = `[END] ${message}. Time elapsed: ${totalTime}ms. Remaning time ${context.getRemainingTimeInMillis()}ms`;
      console.log(endMsg, 'End ' + category);
    };
  };
  const flush = () => {
    console.log('Flush');
  }

  return { flush, log, warn, captureBreadcrumb, captureException, eventStart };
}

function installSentry(ravenDns: string) {
  Sentry.init({ dsn: ravenDns });
}

function installLogdna(logDnaApiKey: string) {
  return dnaLogger.createLogger(logDnaApiKey, {
    env: process.env.NODE_ENV === 'develop' ? 'develop' : 'production',
    index_meta: true
  });
}
