const lessParser = require('postcss-less')
const sassParser = require('postcss-scss')

const Syntax = {
  css: 'css',
  less: 'less',
  scss: 'scss'
}

const COLOR_TYPE = {
  SHORTCUT_HEX: 'SHORTCUT_HEX',
  HEX: 'HEX',
  RGB: 'RGB',
  RGBA: 'RGBA',
  NOT_COLOR: 'NOT_COLOR'
}

const ParserMap = {
  less: lessParser,
  scss: sassParser
}

const VariablePrefix = {
  less: '@',
  scss: '$'
}

module.exports = {
  Syntax,
  ParserMap,
  COLOR_TYPE,
  VariablePrefix
}
