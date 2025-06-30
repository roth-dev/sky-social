const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Ensure compatibility with React Native Web
config.resolver.alias = {
  ...config.resolver.alias,
  'react-native$': 'react-native-web',
};

// Add support for additional file extensions
config.resolver.sourceExts.push('mjs');

// Enable experimental features for better performance
config.transformer.unstable_allowRequireContext = true;

// Remove the problematic transformer path - let Metro use its default
// config.transformer.babelTransformerPath = require.resolve('metro-react-native-babel-transformer');

module.exports = withNativeWind(config, { input: './src/global.css' });