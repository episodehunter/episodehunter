import { Context } from 'aws-lambda';
import * as DnaLogger from 'logdna';
import * as raven from 'raven';

interface DnaLogger {
  log: (message: string, level: 'Debug' | 'Trace' | 'Info' | 'Warn' | 'Error' | 'Fatal') => void;
}

export class Logger {
  private awsContext: Context;
  private ravenDns: string;
  private logDnaApiKey: string;
  private ravenProjectId: string;
  private dnaLogger: DnaLogger;
  private dnaLoggerInstance: any;

  constructor(ravenDns: string, ravenProjectId: string, logDnaApiKey: string) {
    this.ravenDns = ravenDns;
    this.ravenProjectId = ravenProjectId;
    this.logDnaApiKey = logDnaApiKey;
  }

  install(awsContext: Context) {
    this.awsContext = awsContext;
    this.installRaven();
    this.installLogdna();
  }

  info(...args: any[]) {
    console.info(...args);
    this.captureBreadcrumb({
      category: 'info-log',
      message: args.join(', ')
    });
    this.dnaLogger.log(args.join(', '), 'Info');
  }

  log(...args: any[]) {
    console.log(...args);
    this.captureBreadcrumb({
      category: 'log-log',
      message: args.join(', ')
    });
    this.dnaLogger.log(args.join(', '), 'Info');
  }

  warn(...args: any[]) {
    console.warn(...args);
    this.captureBreadcrumb({
      category: 'warn-log',
      message: args.join(', ')
    });
    this.dnaLogger.log(args.join(', '), 'Warn');
  }

  captureBreadcrumb(breadcrumb: { message: string; category: string; data?: object }) {
    raven.captureBreadcrumb(breadcrumb);
  }

  captureException(error: Error) {
    raven.captureException(error);
    this.dnaLogger.log(String(error), 'Fatal');
    DnaLogger.flushAll(() => null);
  }

  captureMessage(msg: string) {
    raven.captureMessage(msg);
  }

  eventStart(message: string, category = 'event') {
    const startMsg = `[START] ${message}. Remaning time ${this.awsContext.getRemainingTimeInMillis()}ms`;
    console.log(startMsg);
    this.captureBreadcrumb({
      category: 'Start ' + category,
      message: startMsg
    });
    const startTime = process.hrtime();
    return () => {
      const endTime = process.hrtime(startTime);
      const totalTime = endTime[0] * 1000 + endTime[1] / 1000000;
      const endMsg = `[END] ${message}. Time elapsed: ${totalTime}ms. Remaning time ${this.awsContext.getRemainingTimeInMillis()}ms`;
      console.log(endMsg);
      this.captureBreadcrumb({
        category: 'End ' + category,
        message: `[END] ${message}. Time elapsed: ${totalTime}ms. Remaning time ${this.awsContext.getRemainingTimeInMillis()}ms`
      });
    };
  }

  private installLogdna() {
    this.dnaLoggerInstance = DnaLogger.setupDefaultLogger(this.logDnaApiKey, {
      app: this.awsContext.functionName,
      env: process.env.NODE_ENV,
      index_meta: true
    });
    this.dnaLogger = {
      log: (message: string, level: string) => {
        this.dnaLoggerInstance.log(message, {
          level,
          meta: { functionName: this.awsContext.functionName, requestId: this.awsContext.awsRequestId }
        });
      }
    };
  }

  private installRaven() {
    raven
      .config(`https://${this.ravenDns}@sentry.io/${this.ravenProjectId}`, {
        extra: {
          functionName: this.awsContext.functionName,
          functionVersion: this.awsContext.functionVersion,
          requestId: this.awsContext.awsRequestId,
          logGroupName: this.awsContext.logGroupName,
          logStreamName: this.awsContext.logStreamName
        },
        autoBreadcrumbs: {
          console: false,
          http: true
        }
      })
      .install();
  }
}
