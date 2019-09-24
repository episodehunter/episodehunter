export const config = {
  sentryDsn: process.env.AWS_SENTRY_DSN!,
  logdnaKey: process.env.LOGDNA_KEY!,
  dragonstoneUrl: process.env.DRAGONSTONE_URL!,
  addShowDragonstoneFunctionName: process.env.ADD_SHOW_DRAGONSTONE_FUNCTION || 'show-updater-prod-add',
}
