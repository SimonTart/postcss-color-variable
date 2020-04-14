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

function resolveFileConfig (searchFrom) {
  const result = explorerSync.search(searchFrom)
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
          const fileFolder = path.dirname(result.filepath)
          return path.resolve(fileFolder, filePath)
        }

        return filePath
      })
    })
  }

  return result.config || {}
}

function getConfig (opts) {
  const fileConfig = resolveFileConfig(opts.searchFrom)
  return Object.assign({}, DefaultConfig, fileConfig, opts)
}

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const config = getConfig(opts)
  const syntax = config.syntax

  const colorToVar = utils.getColorMapFromFiles(config.variableFiles)

  return (root, result) => {
    const needFileMap = {}
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

      Object.assign(needFileMap, replaceResult.needFileMap)
    })

    if (!config.autoImport) {
      return
    }

    if (Object.values(needFileMap).length === 0 || !config.sourcePath) {
      return
    }

    const importedFilePath = {}
    const sourceDir = path.dirname(config.sourcePath)
    let lastImportRule
    root.walkAtRules('import', rule => {
      const filePath = path.resolve(sourceDir, rule.params.replace(/"/g, ''))
      importedFilePath[filePath] = true
      lastImportRule = rule
    })

    const needImportedFilePaths = Object.keys(needFileMap).filter(filePath => !importedFilePath[filePath])
    if (needImportedFilePaths.length === 0) {
      return
    }

    for (const filePath of needImportedFilePaths) {
      const importRule = postcss.atRule({
        name: 'import',
        params: `"${ path.relative(sourceDir, filePath) }"`,
        raws: {
          before: '\n',
          between: '',
          afterName: ' '
        }
      })

      if (lastImportRule) {
        root.insertAfter(lastImportRule, importRule)
      } else {
        root.prepend(importRule)
      }
    }

    root.walkAtRules('import', rule => {
      const filePath = path.resolve(sourceDir, rule.params.replace(/"/g, ''))
      importedFilePath[filePath] = true
      lastImportRule = rule
    })
  }
})
