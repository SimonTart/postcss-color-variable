/* eslint-disable prefer-let/prefer-let */
const postcss = require('postcss')
const fs = require('fs')
const path = require('path')

const utils = require('./utils')
const constant = require('./constant')

const { explorerSync } = utils

const DefaultConfig = {
  variableFiles: [],
  alias: {},
  syntax: constant.Syntax.less,
}


function getPathFolder (filePath) {
  return fs.lstatSync(filePath).isFile() ? path.dirname(filePath) : filePath
}

function resolveConfigFilePath (filePath, configPath) {
  if (!filePath || !configPath) {
    return filePath
  }
  if (path.isAbsolute(filePath)) {
    return filePath
  }

  const folder = getPathFolder(configPath)
  return path.resolve(folder, filePath)
}

function resolveConfigFilesPath (filePaths, configPath) {
  if (!filePaths || !configPath) {
    return filePaths
  }
  return filePaths.map(filePath => {
    if (path.isAbsolute(filePath)) {
      return filePath
    }

    const folder = getPathFolder(configPath)
    return path.resolve(folder, filePath)
  })
}

function resolveConfig (config, configPath) {
  if (!config) {
    return
  }

  const { alias, variableFiles } = config
  config = {
    ...config,
    variableFiles: resolveConfigFilesPath(variableFiles, configPath),
    alias: alias ? Object.keys(config.alias).reduce((result, key) => {
      const aliasPath = alias[key]
      const absolutePath = resolveConfigFilePath(aliasPath, configPath)

      if (path.isAbsolute(absolutePath)) {
        result[key] = absolutePath
        return result
      }

      return result
    }, []) : undefined
  }

  const parsedConfig = {}
  for (const key in config) {
    if (typeof config[key] !== 'undefined') {
      parsedConfig[key] = config[key]
    }
  }

  return parsedConfig
}

function resolveFileConfig (searchFrom) {
  const result = explorerSync.search(searchFrom)
  if (!result) {
    return {}
  }

  return resolveConfig(result.config, result.filepath)

}

function resolveOpts (opts) {
  return resolveConfig(opts, opts.configPath)
}

function getConfig (opts) {
  return Object.assign({}, DefaultConfig, resolveFileConfig(opts.searchFrom), resolveOpts(opts))
}

module.exports = postcss.plugin('postcss-color-variable', (opts = {}) => {
  const config = getConfig(opts)
  const syntax = config.syntax

  const colorToVar = utils.getColorMapFromFiles(config.variableFiles, syntax)
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
      let filePath = rule.params.replace(/"|'/g, '')
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
    const quote = config.singleQuote ? '\'' : '"'
    for (const filePath of needImportedFilePaths) {
      const importRule = postcss.atRule({
        name: 'import',
        params: `${ quote }${ aliasName ? '~' + aliasName + '/' : '' }${ path.relative(importFrom, filePath) }${ quote }`,
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
      const filePath = path.resolve(sourceDir, rule.params.replace(/"|'/g, ''))
      importedFilePath[filePath] = true
      lastImportRule = rule
    })
  }
})
