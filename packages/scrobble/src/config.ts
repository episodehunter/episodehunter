export const config = {
  trackerId: process.env.GA_TRACKING_ID!,
  sentryDsn: process.env.AWS_SENTRY_DSN!,
  logdnaKey: process.env.LOGDNA_KEY!,
  dragonstoneUrl: process.env.DRAGONSTONE_URL!,
  addShowFunctionName: process.env.ADD_SHOW_FUNCTION || 'show-updater-prod-add'
}
