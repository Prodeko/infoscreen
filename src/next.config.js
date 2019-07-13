const withLess = require("@zeit/next-less");
const withPlugins = require("next-compose-plugins");

module.exports = withPlugins([withLess], {
  distDir: "../.next"
});
