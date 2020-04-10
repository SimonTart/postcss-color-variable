/* eslint-disable prefer-let/prefer-let */
const postcss = require('postcss')
const { cosmiconfigSync } = require('cosmiconfig')
const path = require('path')

const utils = require('./utils')
const constant = require('./constant')

const ConfigFileName = 'colorvar'
const DefaultConfig = {
  variableFiles: [],
  syntax: 'css'
}

const explorerSync = cosmiconfigSync(ConfigFileName)

function resolveFileConfig () {
  const result = explorerSync.search(__dirname)
  if (!result) {
    return {}
  }

  if (result.config && result.config.variableFiles) {
    return Object.assign({}, result.config, {
      variableFiles: result.config.variableFiles.map(filePath => {
        if (path.isAbsolute(filePath)) {
          return filePath
        }

        if (result.filepath) {
          const fileFolder = path.dirname(result.filepath);
          return path.resolve(fileFolder, filePath)
        }

        return filePath
      })
    })
  }

  return result.config || {}
}

function getConfig (opts) {
  const fileConfig = resolveFileConfig()
  return Object.assign({}, DefaultConfig, fileConfig, opts)
}

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const config = getConfig(opts)
  const syntax = config.syntax

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
        decl.warn(result, `${ replaceResult.notFoundColors.join(',') } 找不到对应颜色变量`)
      }
    })
  }
})
