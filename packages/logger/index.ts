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
  }

  log(...args: any[]) {
    console.debug(...args);
  }

  warn(...args: any[]) {
    console.warn(...args);
  }

  captureBreadcrumb(breadcrumb: any) {
    raven.captureBreadcrumb(breadcrumb);
  }

  captureException(error: Error) {
    raven.captureException(error);
  }

  captureMessage(msg: string) {
    raven.captureMessage(msg);
  }

  eventStart(message: string) {
    const startMsg = `[START] ${message}. Remaning time ${this.awsContext.getRemainingTimeInMillis()}ms`;
    this.log(startMsg);
    this.captureBreadcrumb({
      message: startMsg,
      category: 'start'
    });
    const startTime = process.hrtime();
    return () => {
      const endTime = process.hrtime(startTime);
      const totalTime = endTime[0] * 1000 + endTime[1] / 1000000;
      const endMsg = `[END] ${message}. Time elapsed: ${totalTime}ms. Remaning time ${this.awsContext.getRemainingTimeInMillis()}ms`;
      this.captureBreadcrumb({
        message: endMsg,
        category: 'end'
      });
      this.log(endMsg);
    };
  }

  private installRaven() {
    raven
      .config(`https://${this.ravenDns}@sentry.io/${this.ravenProjectId}`, {
        extra: {
          functionName: this.awsContext ? this.awsContext.functionName : ''
        },
        autoBreadcrumbs: {
          console: true,
          http: true
        }
      })
      .install();
  }
}
