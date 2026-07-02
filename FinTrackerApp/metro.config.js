const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

module.exports = (() => {
  const config = getDefaultConfig(__dirname);

  const { transformer, resolver } = config;

  config.transformer = {
    ...transformer,
    babelTransformerPath: require.resolve('react-native-svg-transformer/expo')
  };
  config.resolver = {
    ...resolver,
    assetExts: resolver.assetExts.filter((ext) => ext !== 'svg'),
    sourceExts: [...resolver.sourceExts, 'svg'],
  };

  // Fix Windows watcher issue — exclude temp native build artifacts
  const { blockList } = config.resolver;
  const escapedDirname = __dirname.replace(/[\\^$.*+?()[\]{}|]/g, '\\$&');

  config.resolver.blockList = [
    ...(Array.isArray(blockList) ? blockList : blockList ? [blockList] : []),
    new RegExp(`${escapedDirname.replace(/\\\\/g, '\\\\\\\\')}[/\\\\]node_modules[/\\\\]\\..*[/\\\\]android[/\\\\].*`),
  ];

  return config;
})();
