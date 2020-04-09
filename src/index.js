/* eslint-disable prefer-let/prefer-let */
const postcss = require('postcss')
const rc = require('rc')
const path = require('path')

const utils = require('./utils')
const constant = require('./constant')

function getConfig (opts) {
  const config = rc('colorvariable', opts) || {}
  let configFolder
  if (config.config) {
    configFolder = config.config.split('.colorvariable')[0]
  }
  console.log(config)
  const variableFiles = (config.variableFiles || []).map(filePath => {
    if (path.isAbsolute(filePath)) {
      return filePath
    }
    if (configFolder) {
      return path.resolve(configFolder, filePath)
    }
    return filePath
  })

  return {
    ...config,
    variableFiles
  }
}

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const config = getConfig(opts)
  const syntax = config.syntax || constant.Syntax.CSS

  const colorToVar = utils.getColorMapFromFiles(config.variableFiles)

  return (root, result) => {
    root.walkDecls(decl => {
      const replaceResult = utils.replaceColor(decl.value, colorToVar, syntax)

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
