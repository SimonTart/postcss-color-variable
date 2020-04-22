/* eslint-disable prefer-let/prefer-let */
const optionator = require('optionator')
const fs = require('fs')
const postcss = require('postcss')
const ColorVarPlugin = require('./index')
const path = require('path')

const constant = require('../src/constant')
const utils = require('../src/utils')
const { explorerSync } = utils

const options = optionator({
  prepend: 'Usage: colorvar [options]',
  options: [
    {
      option: 'syntax',
      alias: 's',
      type: 'String',
      required: false,
      description: '语法: 支持 less 和 scss , 默认less',
      example: 'postcss-color-variable ./index.less --syntax less'
    }
  ]
})

function run (args) {
  const currentOptions = options.parse(args)
  let filePath = currentOptions._ && currentOptions._[0]
  if (!filePath) {
    console.error('必须指定一个文件')
    process.exit(1)
  }
  if (!path.isAbsolute(filePath)) {
    filePath = path.resolve(process.cwd(), filePath)
  }

  if (!fs.existsSync(filePath)) {
    console.error(`${ filePath } 不存在`)
    process.exit(1)
  }

  if (!fs.lstatSync(filePath).isFile()) {
    console.error(`${ filePath } 必须是一个文件`)
    process.exit(1)
  }

  const result = explorerSync.search(filePath)
  const fileConfig = result ? result.config : {}
  const syntax = currentOptions.syntax || fileConfig.syntax

  if (!Object.keys(constant.Syntax).includes(syntax)) {
    console.error(`不支持的语法 ${ syntax }`)
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, { encoding: 'utf-8' })

  postcss([ColorVarPlugin({
    searchFrom: filePath,
    sourcePath: filePath,
    syntax,
  })]).process(content, {
    from: undefined,
    syntax: constant.ParserMap[syntax]
  })
    .then((result) => {
      fs.writeFileSync(filePath, result.content, { encoding: 'utf-8' })
    })

}

module.exports = {
  run
}
