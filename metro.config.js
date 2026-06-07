const path = require('path');
const { getDefaultConfig } = require('expo/metro-config');

// Native-only modules that must not be bundled for the web demo. On web they are
// redirected to harmless stubs (the local WatermelonDB database is disabled —
// all data comes from the remote API).
const WEB_MODULE_STUBS = {
  '@nozbe/watermelondb/react': path.resolve(__dirname, 'web-stubs/watermelon-react.js'),
  '@nozbe/watermelondb/adapters/sqlite': path.resolve(__dirname, 'web-stubs/sqlite-empty.js'),
  'react-native-sqlite-storage': path.resolve(__dirname, 'web-stubs/sqlite-empty.js'),
  // Native-only dev tool (deep-imports react-native internals that don't exist on web).
  'reactotron-react-native': path.resolve(__dirname, 'web-stubs/empty-module.js'),
  'reactotron-redux': path.resolve(__dirname, 'web-stubs/empty-module.js'),
  // react-native-collapsible's height-measuring ghost view overlaps content on
  // react-native-web; use a simple show/hide replacement instead.
  'react-native-collapsible': path.resolve(__dirname, 'web-stubs/collapsible.js'),
};

module.exports = (async () => {
  const config = await getDefaultConfig(__dirname);
  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer'),
  };

  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
    resolveRequest: (context, moduleName, platform) => {
      if (platform === 'web' && WEB_MODULE_STUBS[moduleName]) {
        return { type: 'sourceFile', filePath: WEB_MODULE_STUBS[moduleName] };
      }
      // Always delegate to the default (Expo) resolver so its web aliasing
      // (react-native -> react-native-web, etc.) keeps working.
      return context.resolveRequest(context, moduleName, platform);
    },
  };

  return config;
})();
