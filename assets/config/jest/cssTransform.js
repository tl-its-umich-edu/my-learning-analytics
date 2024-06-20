// // This is a custom Jest transformer turning style imports into empty objects.
// // http://facebook.github.io/jest/docs/en/webpack.html

// const cssTransform = {
//   process() {
//     return 'module.exports = {};';
//   },
//   getCacheKey() {
//     // The output is always the same.
//     return 'cssTransform';
//   }
// };

const babelJest = require('babel-jest');

// Export the transformer function
module.exports = {
  process(src, filename, config, options) {
    return babelJest.process(src, filename, config, options);
  },
  'type': 'module',
  extensionsToTreatAsEsm: ['.js', '.jsx']
};


