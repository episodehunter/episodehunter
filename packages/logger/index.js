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

Object.defineProperty(exports, '__esModule', {
  value: true
});
exports.createLogger = createLogger;
