const presets = ['@vue/app'];
const plugins = [];

if (process.env.NODE_ENV === 'test') {
  plugins.push('istanbul');
}

module.exports = {
  presets,
  plugins
};
