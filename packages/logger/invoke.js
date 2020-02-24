const createAnalytics = require('./dist/analytics').createAnalytics;

const event = {
  category: 'show',
  action: 'follow',
  type: 'event'
};

const pageView = {
  url: '/movie',
  title: 'Dexter',
  type: 'pageview',
  cid: 2
};

createAnalytics(process.argv[2]).trackEvent(pageView)
