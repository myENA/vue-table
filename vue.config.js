const webpack = require('webpack');
const path = require('path');
const pkg = require('./package.json');

module.exports = {
  lintOnSave: false,
  configureWebpack: (/* config */) => {
    const customConfig = {
      plugins: [
        new webpack.ProvidePlugin({
          $: 'jquery',
          jquery: 'jquery',
          jQuery: 'jquery',
          'window.jquery': 'jquery',
          'window.jQuery': 'jquery',
          'window.$': 'jquery',
        }),
        new webpack.DefinePlugin({
          LIBNAME: JSON.stringify(pkg.libname),
        }),
      ],
    };
    // config for lib
    if (process.env.VUE_CLI_BUILD_TARGET === 'lib') {
      // set external modules so they won't get bundled with the lib
      customConfig.externals = [
        'vue',
        'axios',
      ];
    }
    // config parameter can be mutated
    // or a new object (to be used with webpack-merge) returned
    return customConfig;
  },
  chainWebpack: (config) => {
    config.resolve.alias.set('vue', '@vue/compat')

    config.module
      .rule('vue')
      .use('vue-loader')
      .tap(options => {
        return {
          ...options,
          compilerOptions: {
            compatConfig: {
              MODE: 2
            }
          }
        }
      })
  },
};
