let postcss = require('postcss')

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const varFiles = opts.variables || [];
  const colorToVar = {};

  for(const file of varFiles) {

    postcss.parse(file).walkDecls((dec))
  }
  // Work with options here

  return (root, result) => {

    root.walkDecls(() => {

    })

  }
})
