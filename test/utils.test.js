/* eslint-disable prefer-let/prefer-let */
const path = require('path')

const utils = require('../src/utils')
const constant = require('../src/constant')

describe('test parseColor', () => {
  it('should return shortcuthex', () => {
    expect(utils.parseColor('#0a1')).toEqual(utils.appendId({
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: 0,
      g: 170,
      b: 17,
      a: 1
    }))

    expect(utils.parseColor('#0A1')).toEqual(utils.appendId({
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: 0,
      g: 170,
      b: 17,
      a: 1
    }))
  })

  it('should return hex', () => {
    expect(utils.parseColor('#ffa1ab')).toEqual(utils.appendId({
      type: constant.COLOR_TYPE.HEX,
      r: 255,
      g: 161,
      b: 171,
      a: 1
    }))

    expect(utils.parseColor('#FFA1AB')).toEqual(utils.appendId({
      type: constant.COLOR_TYPE.HEX,
      r: 255,
      g: 161,
      b: 171,
      a: 1
    }))
  })

  it('should return rgb', () => {
    expect(utils.parseColor('rgb(255,10,1)')).toEqual(utils.appendId({
      type: constant.COLOR_TYPE.RGB,
      r: 255,
      g: 10,
      b: 1,
      a: 1
    }))
  })

  it('should return rgba', () => {
    expect(utils.parseColor('rgba(12,1,245,0.1)')).toEqual(utils.appendId({
      type: constant.COLOR_TYPE.RGBA,
      r: 12,
      g: 1,
      b: 245,
      a: 0.1
    }))
  })

  it('should return not color', () => {
    let notColor = utils.appendId({
      type: constant.COLOR_TYPE.NOT_COLOR
    })

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

describe('test getColorId', () => {
  it('should return right color id', () => {
    expect(utils.getColorId(1, 2, 3, 0.1)).toBe('1-2-3-0.1')
  })
})

describe('test appenId', () => {
  it('should return  color with id', () => {
    const color = {
      r: 1,
      g: 1,
      b: 2,
      a: 1
    }
    expect(utils.appendId(color).id).toBe('1-1-2-1')
  })
})

describe('test getColorMapFromFiles', () => {
  it('should return right map', async () => {
    const colorToVar = utils.getColorMapFromFiles([path.resolve(__dirname, './less/color-var.less')])
    const rightColors = [{
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: 0,
      g: 170,
      b: 17,
      a: 1,
      name: 'short-hex',
      param: '#0a1'
    }, {
      type: constant.COLOR_TYPE.RGBA,
      r: 66,
      g: 139,
      b: 202,
      a: 0.1,
      name: 'link-color',
      param: 'rgba(66, 139, 202, 0.1)'
    }]
    const result = rightColors.reduce((map, color) => {
      const c = utils.appendId(color)
      map[c.id] = c
      return map
    }, {})

    expect(colorToVar).toEqual(result)
  })

  it('should return empty when file not exist', async () => {
    const colorToVar = utils.getColorMapFromFiles([path.resolve(__dirname, './less/empty.less')])
    expect(colorToVar).toEqual({})
  })
})
