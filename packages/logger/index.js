const raven = require('raven');

function createLogger(dsn, projectId) {
  raven.config('https://' + dsn + '@sentry.io/' + projectId).install();
  return raven;
}

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createLogger = createLogger;
exports.Logger = Logger;
