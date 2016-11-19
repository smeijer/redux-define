const path = require('path');
const fs = require('fs');

process.env.BABEL_ENV = 'test';
process.env.NODE_ENV = 'production';

module.exports = function (wallaby) {
  process.env.NODE_PATH += path.delimiter +
    path.join(wallaby.localProjectDir, 'src', 'node_modules');

  const babelConfig = JSON.parse(fs.readFileSync('.babelrc', 'utf8'));
  babelConfig.babel = require('./node_modules/babel-core');
  const babelCompiler = wallaby.compilers.babel(babelConfig);

  return {
    files: [
      'src/**/*.js',
      '!src/**/__tests__/**/*.js',
    ],
    tests: [
      'src/**/__tests__/**/*.js',
    ],
    compilers: {
      '**/*.js': babelCompiler,
    },
    env: {
      type: 'node',
      params: {
        env: [
          'NODE_ENV=production',
        ].join(';'),
      },
    },
    debug: false,
    testFramework: 'mocha',

    setup: () => {
    },
  };
};
