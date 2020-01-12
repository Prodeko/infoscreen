const withLess = require('@zeit/next-less')
const withSourceMaps = require('@zeit/next-source-maps')()

module.exports = withLess(
  withSourceMaps({
    webpack(config, _options) {
      return config
    },
  }),
)
