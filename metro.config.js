const { getDefaultConfig } = require('expo/metro-config');

const config = getDefaultConfig(__dirname);

// Ensure only one React instance
config.resolver.alias = {
  ...config.resolver.alias,
  'react': require.resolve('react'),
  'react-native': require.resolve('react-native'),
};

// Ensure proper module resolution
config.resolver.platforms = ['ios', 'android', 'native', 'web'];

// Fix for Image component issues
config.resolver.sourceExts = [...config.resolver.sourceExts, 'cjs'];

// Disable inline requires for better compatibility
config.transformer.inlineRequires = false;

module.exports = config;
