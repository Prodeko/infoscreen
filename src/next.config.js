const withTypescript = require("@zeit/next-typescript");
const withLess = require("@zeit/next-less");
const withPlugins = require("next-compose-plugins");

module.exports = withPlugins([withTypescript, withLess], {
  distDir: "../.next"
});
