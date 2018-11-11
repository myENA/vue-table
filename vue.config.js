const webpack = require('webpack');
const pkg = require('./package.json');

module.exports = {
  css: {
    loaderOptions: {
      css: {
        localIdentName: `${pkg.libname}[name]_[local]_[hash:base64:5]`,
      },
    },
  },
  lintOnSave: false,
  configureWebpack: (/*config*/) => {
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
    // config for production
    if (process.env.NODE_ENV === 'production') {
      // set external modules so they won't get bundled with the lib
      customConfig.externals = [
        'bootbox',
        'bootstrap',
        'font-awesome',
        'jquery',
        'vue',
      ];
    }
    // config parameter can be mutated
    // or a new object (to be used with webpack-merge) returned
    return customConfig;
  },
};
