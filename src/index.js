/* eslint-disable prefer-let/prefer-let */
const postcss = require('postcss')
const { cosmiconfigSync } = require('cosmiconfig')
const path = require('path')

const utils = require('./utils')
const constant = require('./constant')

const ConfigFileName = 'colorvar'
const DefaultConfig = {
  variableFiles: [],
  alias: {},
  syntax: 'css'
}

const explorerSync = cosmiconfigSync(ConfigFileName)

function resolveFileConfig (searchFrom) {
  const result = explorerSync.search(searchFrom)
  if (!result) {
    return {}
  }
  const variableFiles = (result.config && result.config.variableFiles) || []
  const alias = (result.config && result.config.alias) || {}
  if (result.config) {
    return Object.assign({}, result.config, {
      variableFiles: variableFiles.map(filePath => {
        if (path.isAbsolute(filePath)) {
          return filePath
        }

        if (result.filepath) {
          const fileFolder = path.dirname(result.filepath)
          return path.resolve(fileFolder, filePath)
        }

        return filePath
      }),
      alias: Object.keys(alias).reduce((result, key) => {
        const aliasPath = alias[key]
        if (path.isAbsolute(aliasPath)) {
          result[key] = aliasPath
          return result
        }

        if (result.filepath) {
          const fileFolder = path.dirname(result.filepath)
          const absolutePath = path.isAbsolute(aliasPath) ? aliasPath : path.relative(fileFolder, aliasPath)
          if (path.isAbsolute((absolutePath))) {
            result[key] = absolutePath
            return result
          }
        }

        return result
      }, [])
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
      let filePath = rule.params.replace(/"/g, '')
      filePath = utils.resolvePathWithAlias(filePath, config.alias)
      if (!path.isAbsolute(filePath)) {
        filePath = path.resolve(sourceDir, filePath)
      }
      importedFilePath[filePath] = true
      lastImportRule = rule
    })

    const needImportedFilePaths = Object.keys(needFileMap).filter(filePath => !importedFilePath[filePath])
    if (needImportedFilePaths.length === 0) {
      return
    }

    const aliasName = config.usingAlias && config.alias && config.alias[config.usingAlias] ? config.usingAlias : undefined
    const importFrom = aliasName ? config.alias[aliasName] : sourceDir
    for (const filePath of needImportedFilePaths) {
      const importRule = postcss.atRule({
        name: 'import',
        params: `"${ aliasName ? '~' + aliasName + '/' : '' }${ path.relative(importFrom, filePath) }"`,
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
