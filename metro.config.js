// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

// Get the default config
const config = getDefaultConfig(__dirname);

// Set resolver main fields to prioritize React Native resolution
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config; 