const dev = process.env.NODE_ENV !== 'production'
const env = dev ? require('./dev.env') : require('./prod.env')

module.exports = {
  ...env,
  GIPHY_KEY: 'M8Ll8d2z3k1BdynO20PRFx294PsCpzqV',
  SENTRY_DSN: 'https://154924ee935147ae9f173e5b2b23665c@sentry.prodeko.org/3',
}
