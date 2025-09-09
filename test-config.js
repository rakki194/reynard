// Test config file for ESLint configuration
// This should have Node.js globals available
const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",
  globalVar: global,
  nodeVersion: process.version,
  requireTest: require,
  moduleTest: module,
  exportsTest: exports,
  dirnameTest: __dirname,
  filenameTest: __filename,
};

module.exports = config;
