/* eslint-disable prefer-let/prefer-let */
const postcss = require('postcss')

const utils = require('./utils')
const constant = require('./constant')

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const varFiles = opts.variables || []

  const colorToVar = utils.getColorMapFromFiles(varFiles)

  return (root, result) => {
    root.walkDecls(decl => {
      const replaceResult = utils.replaceColor(decl.value, colorToVar)

      if (replaceResult.type === constant.COLOR_TYPE.NOT_COLOR) {
        return
      }

      if (replaceResult.value !== decl.value) {
        const newDecl = decl.clone()
        newDecl.value = replaceResult.value
        decl.replaceWith(newDecl)
      }
      if (replaceResult.isMatchColor && replaceResult.notFoundColors.length > 0) {
        decl.warn(result, `[${ replaceResult.notFoundColors.join(',') }]找不到对应颜色变量`)
      }
    })
  }
})
