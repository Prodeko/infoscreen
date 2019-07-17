const dev = process.env.NODE_ENV !== "production";
const env = dev ? require("./dev.env") : require("./prod.env");

module.exports = { ...env, GIPHY_KEY: 'yourgiphykeyhere', GIPHY_SEARCH: 'funny' };
