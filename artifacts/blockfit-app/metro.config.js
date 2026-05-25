const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const config = getDefaultConfig(__dirname);

// Ensure font files are included in the bundle
config.resolver.assetExts.push(
  "ttf",
  "otf",
  "woff",
  "woff2"
);

// Add Ionicons fonts to project roots so they get bundled
config.projectRoot = __dirname;

module.exports = config;
