/* eslint-disable prefer-let/prefer-let */
const fs = require('fs')
const lessParser = require('postcss-less')

const constant = require('./constant')

class ColorRegExp {
  static get ShortcutHex () {
    return /^#[0-9a-fA-F]{3}$/g
  }

  static get ShortcutHexReplace () {
    return /(^|\s|,|\()(#[0-9a-fA-F]{3})($|\s|,\)|;)/g
  }

  static get Hex () {
    return /^#[0-9a-fA-F]{6}$/g
  }

  static get HexReplace () {
    return /(^|\s|,|\()(#[0-9a-fA-F]{6})($|\s|,\)|;)/g
  }

  static get RGB () {
    // eslint-disable-next-line security/detect-unsafe-regex
    return /^rgb\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)$/g
  }

  static get RGBReplace () {
    // eslint-disable-next-line security/detect-unsafe-regex
    return /(^|\s|,|\()(rgb\((?:\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\))($|\s|,\)|;)/g
  }

  static get RGBA () {
    // eslint-disable-next-line security/detect-unsafe-regex
    return /^rgba\((\s*\d{1,3}\s*,){3}\s*(\d\.)?\d+\s*\)$/g
  }

  static get RGBAReplace () {
    // eslint-disable-next-line security/detect-unsafe-regex
    return /(^|\s|,|\()(rgba\((?:\s*\d{1,3}\s*,){3}\s*(?:\d\.)?\d+\s*\))($|\s|,\)|;)/g
  }
}

function isValidRgbUnit (v) {
  return v >= 0 && v <= 255
}

function isValidAlpha (v) {
  return v >= 0 && v <= 1
}

function parseColor (value) {
  let color = {
    type: constant.COLOR_TYPE.NOT_COLOR
  }

  if (ColorRegExp.ShortcutHex.test(value)) {
    let rgbArr = value.slice(1).split('').map(hexValue => {
      return Number.parseInt(hexValue.repeat(2), 16)
    })
    color = {
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: 1
    }
  }

  if (ColorRegExp.Hex.test(value)) {
    let rgbArr = Array.from(value.match(/[0-9a-fA-F]{2}/g)).map(hexValue => {
      return Number.parseInt(hexValue, 16)
    })
    color = {
      type: constant.COLOR_TYPE.HEX,
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: 1
    }
  }

  if (ColorRegExp.RGB.test(value)) {
    let matches = Array.from(value.match(/\d{1,3}/g))
    let matchValues = matches.map(match => Number.parseInt(match, 10))
    if (matchValues.every(isValidRgbUnit)) {
      color = {
        type: constant.COLOR_TYPE.RGB,
        r: matchValues[0],
        g: matchValues[1],
        b: matchValues[2],
        a: 1
      }
    }
  }

  if (ColorRegExp.RGBA.test(value)) {
    let matches = value.match(/\d{1,3}/g)
    let rgbValues = matches.slice(0, 3).map(match => Number.parseInt(match, 10))
    let alphaValue = Number.parseFloat(value.match(/(\d\.)?\d+\s*\)$/)[0].replace(/\s*\)$/, ''))

    if (
      rgbValues.every(isValidRgbUnit) &&
      isValidAlpha(alphaValue)
    ) {
      color = {
        type: constant.COLOR_TYPE.RGBA,
        r: rgbValues[0],
        g: rgbValues[1],
        b: rgbValues[2],
        a: alphaValue
      }
    }
  }

  appendId(color)

  return color
}

function getColorId (r, g, b, a) {
  return `${ r }-${ g }-${ b }-${ a }`
}

function appendId (color) {
  color.id = getColorId(color.r, color.g, color.b, color.a)
  return color
}

function getColorMapFromFiles (files) {
  const colorToVariable = {}
  for (const file of files) {
    if (!fs.existsSync(file)) {
      continue
    }

    const css = fs.readFileSync(file, { encoding: 'utf-8' })
    const root = lessParser.parse(css)
    root.walkAtRules((node) => {
      const color = parseColor(node.params)
      if (color.type === constant.COLOR_TYPE.NOT_COLOR) {
        return
      }
      color.param = node.params
      color.name = node.name
      colorToVariable[color.id] = color
    })
  }

  return colorToVariable
}

function replaceColor (value, colorToVar) {
  for (const replaceRegExp of [ColorRegExp.ShortcutHexReplace, ColorRegExp.HexReplace, ColorRegExp.RGBReplace, ColorRegExp.RGBAReplace]) {
    value = value.replace(replaceRegExp, (match, p1, p2, p3) => {
      const color = parseColor(p2)
      if (color.type === constant.COLOR_TYPE.NOT_COLOR) {
        return p1 + p2 + p3
      }

      const colorVar = colorToVar[color.id]
      if (colorVar && colorVar.name) {
        return p1 + `@${ colorVar.name }` + p3
      }

      return p1 + p2 + p3
    })
  }

  return value
}

module.exports = {
  getColorMapFromFiles,
  parseColor,
  getColorId,
  appendId,
  replaceColor
}
