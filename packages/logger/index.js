const raven = require('raven');

function createLogger(dsn, projectId, functionName = 's') {
  raven.config('https://' + dsn + '@sentry.io/' + projectId, {
    extra: {
      functionName
    },
    autoBreadcrumbs: {
      console: true,
      http: true,
    }
  }).install();
  return raven;
}

exports.createLogger = createLogger;
