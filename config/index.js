const dev = process.env.NODE_ENV !== "production";
const env = dev ? require("./dev.env") : require("./prod.env");

module.exports = { ...env, GIPHY_KEY: 'M8Ll8d2z3k1BdynO20PRFx294PsCpzqV' };
