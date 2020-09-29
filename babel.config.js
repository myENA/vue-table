const presets = ['@vue/cli-plugin-babel/preset'];
const plugins = [];

if (process.env.NODE_ENV === 'test') {
  plugins.push('istanbul');
}

module.exports = {
  presets,
  plugins
};
