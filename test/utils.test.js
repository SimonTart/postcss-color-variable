const path = require('path')
const utils = require('../src/utils')
const constant = require('../src/constant')

describe('test parseColor', () => {
  it('should return shortcuthex', () => {
    expect(utils.parseColor('#0a1')).toEqual({
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: 0,
      g: 170,
      b: 17,
      a: 1
    })

    expect(utils.parseColor('#0A1')).toEqual({
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: 0,
      g: 170,
      b: 17,
      a: 1
    })
  })

  it('should return hex', () => {
    expect(utils.parseColor('#ffa1ab')).toEqual({
      type: constant.COLOR_TYPE.HEX,
      r: 255,
      g: 161,
      b: 171,
      a: 1
    })

    expect(utils.parseColor('#FFA1AB')).toEqual({
      type: constant.COLOR_TYPE.HEX,
      r: 255,
      g: 161,
      b: 171,
      a: 1
    })
  })

  it('should return rgb', () => {
    expect(utils.parseColor('rgb(255,10,1)')).toEqual({
      type: constant.COLOR_TYPE.RGB,
      r: 255,
      g: 10,
      b: 1,
      a: 1
    })
  })

  it('should return rgba', () => {
    expect(utils.parseColor('rgba(12,1,245,0.1)')).toEqual({
      type: constant.COLOR_TYPE.RGBA,
      r: 12,
      g: 1,
      b: 245,
      a: 0.1
    })
  })

  it('should return not color', () => {
    let notColor = {
      type: constant.COLOR_TYPE.NOT_COLOR
    }
    expect(utils.parseColor('fff')).toEqual(notColor)
    expect(utils.parseColor('#f0')).toEqual(notColor)
    expect(utils.parseColor('#00g')).toEqual(notColor)

    expect(utils.parseColor('#f004')).toEqual(notColor)
    expect(utils.parseColor('#f004111')).toEqual(notColor)
    expect(utils.parseColor('#g00000')).toEqual(notColor)

    expect(utils.parseColor('rgb(0,0,0,1)')).toEqual(notColor)
    expect(utils.parseColor('rgb(0,0)')).toEqual(notColor)
    expect(utils.parseColor('rgb(0,0,256)')).toEqual(notColor)

    expect(utils.parseColor('rgba(0,0,0,1,1)')).toEqual(notColor)
    expect(utils.parseColor('rgba(0,0)')).toEqual(notColor)
    expect(utils.parseColor('rgba(0,0,256,1)')).toEqual(notColor)
    expect(utils.parseColor('rgba(0,0,0,1.2)')).toEqual(notColor)
  })
})

// it('test', () => {
//   utils.parseVar([path.resolve(__dirname, './color-var.less')])
// })
