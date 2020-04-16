/* eslint-disable prefer-let/prefer-let */
const optionator = require('optionator')
const fs = require('fs')
const postcss = require('postcss')
const ColorVarPlugin = require('./index')
const lessSyntax = require('postcss-less')
const path = require('path')

const options = optionator({
  prepend: 'Usage: colorvar [options]',
  options: []
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

  const content = fs.readFileSync(filePath, { encoding: 'utf-8' })
  postcss([ColorVarPlugin({
    searchFrom: filePath,
    sourcePath: filePath,
    syntax: 'less'
  })]).process(content, {
    from: undefined,
    syntax: lessSyntax
  })
    .then((result) => {
      fs.writeFileSync(filePath, result.content, { encoding: 'utf-8' })
    })

}

module.exports = {
  run
}
