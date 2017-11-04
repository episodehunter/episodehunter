import { Context } from 'aws-lambda';
import * as raven from 'raven';

export class Logger {
  private awsContext: Context;
  private ravenDns: string;
  private ravenProjectId: string;

  constructor(ravenDns: string, ravenProjectId: string) {
    this.ravenDns = ravenDns;
    this.ravenProjectId = ravenProjectId;
  }

  install(awsContext: Context) {
    this.awsContext = awsContext;
    this.installRaven();
  }

  info(...args: any[]) {
    console.info(...args);
    this.captureBreadcrumb({
      category: 'console.info',
      message: args.join(', ')
    });
  }

  log(...args: any[]) {
    console.log(...args);
    this.captureBreadcrumb({
      category: 'console.log',
      message: args.join(', ')
    });
  }

  warn(...args: any[]) {
    console.warn(...args);
    this.captureBreadcrumb({
      category: 'console.warn',
      message: args.join(', ')
    });
  }

  captureBreadcrumb(breadcrumb: { message: string; category: string; data?: object }) {
    raven.captureBreadcrumb(breadcrumb);
  }

  captureException(error: Error) {
    raven.captureException(error);
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

  private installRaven() {
    raven
      .config(`https://${this.ravenDns}@sentry.io/${this.ravenProjectId}`, {
        extra: {
          functionName: this.awsContext ? this.awsContext.functionName : ''
        },
        autoBreadcrumbs: {
          console: false,
          http: true
        }
      })
      .install();
  }
}
