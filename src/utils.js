/* eslint-disable prefer-let/prefer-let */
const fs = require('fs')
const postcss = require('postcss')
const lessParser = require('postcss-less')

const constant = require('./constant')

function promise (fn) {
  return function (...args) {
    return new Promise((resolve, reject) => {
      fn(...args, (error, data) => {
        if (error) {
          reject(error)
        } else {
          resolve(data)
        }
      })
    })
  }
}

function isValidRgbUnit (v) {
  return v >= 0 && v <= 255
}

function isValidAlpha (v) {
  return v >= 0 && v <= 1
}

function parseColor (value) {
  if (/^#[0-9a-fA-F]{3}$/g.test(value)) {
    let rgbArr = value.slice(1).split('').map(hexValue => {
      return Number.parseInt(hexValue.repeat(2), 16)
    })
    return {
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: 1
    }
  }

  if (/^#[0-9a-fA-F]{6}$/g.test(value)) {
    let rgbArr = Array.from(value.match(/[0-9a-fA-F]{2}/g)).map(hexValue => {
      return Number.parseInt(hexValue, 16)
    })
    return {
      type: constant.COLOR_TYPE.HEX,
      r: rgbArr[0],
      g: rgbArr[1],
      b: rgbArr[2],
      a: 1
    }
  }

  // eslint-disable-next-line security/detect-unsafe-regex
  if (/^rgb\((\s*\d{1,3}\s*,){2}\s*\d{1,3}\s*\)$/g.test(value)) {
    let matches = Array.from(value.match(/\d{1,3}/g))
    let matchValues = matches.map(match => Number.parseInt(match, 10))
    if (matchValues.every(isValidRgbUnit)) {
      return {
        type: constant.COLOR_TYPE.RGB,
        r: matchValues[0],
        g: matchValues[1],
        b: matchValues[2],
        a: 1
      }
    } else {
      return {
        type: constant.COLOR_TYPE.NOT_COLOR
      }
    }
  }

  // eslint-disable-next-line security/detect-unsafe-regex
  if (/^rgba\((\s*\d{1,3}\s*,){3}\s*(\d\.)?\d+\s*\)$/g.test(value)) {
    let matches = value.match(/\d{1,3}/g)
    let rgbValues = matches.slice(0, 3).map(match => Number.parseInt(match, 10))
    let alphaValue = Number.parseFloat(value.match(/(\d\.)?\d+\s*\)$/)[0].replace(/\s*\)$/, ''))

    if (
      rgbValues.every(isValidRgbUnit) &&
      isValidAlpha(alphaValue)
    ) {
      return {
        type: constant.COLOR_TYPE.RGBA,
        r: rgbValues[0],
        g: rgbValues[1],
        b: rgbValues[2],
        a: alphaValue
      }
    } else {
      return {
        type: constant.COLOR_TYPE.NOT_COLOR
      }
    }
  }

  return { type: constant.COLOR_TYPE.NOT_COLOR }
}

function getColorId (color) {
  return `${ color.r }-${ color.g }-${ color.b }-${ color.a }`
}

async function getColorMapFromFiles (files) {
  const colorToVariable = {}
  for (const file of files) {
    const css = await promise(fs.readFile)(file, { encoding: 'utf-8' })
    const root = lessParser.parse(css)
    root.walkAtRules((node) => {
      const color = parseColor(node.params)
      if (color.type === constant.COLOR_TYPE.NOT_COLOR) {
        return
      }

      color.param = node.params
      color.name = node.name
      colorToVariable[getColorId(color)] = color
    })
  }

  return colorToVariable
}

module.exports = {
  promise,
  getColorMapFromFiles,
  parseColor,
  getColorId
}
