const {
  wrapWithReanimatedMetroConfig,
} = require("react-native-reanimated/metro-config");

const config = {
  transformer: {
    minifierConfig: {
      keep_classnames: false,
      keep_fnames: false,
      mangle: {
        toplevel: true,
      },
      output: {
        ascii_only: true,
        quote_style: 3,
        wrap_iife: true,
      },
      sourceMap: false,
      compress: {
        global_defs: {
          __DEV__: false,
        },
        unused: true,
      },
    },
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  resolver: {
    sourceExts: ["js", "jsx", "ts", "tsx", "json"],
  },
};

module.exports = wrapWithReanimatedMetroConfig(config);
