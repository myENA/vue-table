module.exports = {
  preset: '@vue/cli-plugin-unit-jest',
  transform: {
    '^.+\\.vue$': 'vue-jest',
    '.*\\.(js)$': 'babel-jest',
  },
  moduleFileExtensions: [
    'js',
    'json',
    'vue',
  ],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverage: true,
  collectCoverageFrom: [
    'src/**/*.{js,vue}',
    '!**/node_modules/**',
    '!src/App.vue',
    '!src/main.js',
    '!src/components/entry.js',
  ],
};
