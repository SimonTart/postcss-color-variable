/* eslint-disable prefer-let/prefer-let */
const postcss = require('postcss')

const utils = require('./utils')
const constant = require('./constant')

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const varFiles = opts.variables || []

  const colorToVar = utils.getColorMapFromFiles(varFiles)

  return (root, result) => {
    root.walkDecls(decl => {
      const color = utils.parseColor(decl.value)
      if (color.type === constant.COLOR_TYPE.NOT_COLOR) {
        return
      }

      const colorVar = colorToVar[color.id]

      if (colorVar && colorVar.name) {
        const newDecl = decl.clone()
        newDecl.value = `@${ colorVar.name }`
        decl.replaceWith(newDecl)
      }
    })
  }
})
