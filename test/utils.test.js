/* eslint-disable prefer-let/prefer-let */
const path = require('path')

const utils = require('../src/utils')
const constant = require('../src/constant')

describe('test parseColor', () => {
  it('should return SHORTCUT_HEX type', () => {
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

  it('should return HEX type', () => {
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

  it('should return RGB type', () => {
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

  it('should return NOT_COLOR type', () => {
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

describe('test appendId', () => {
  it('should return  append color with id', () => {
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
    const colorFilePath = path.resolve(__dirname, './less/color-var.less')
    const rightColors = [
      {
        type: constant.COLOR_TYPE.SHORTCUT_HEX,
        r: 0,
        g: 170,
        b: 17,
        a: 1,
        name: 'short-hex',
        param: '#0a1',
        filePath: colorFilePath
      }, {
        type: constant.COLOR_TYPE.RGBA,
        r: 66,
        g: 139,
        b: 202,
        a: 0.1,
        name: 'link-color',
        param: 'rgba(66, 139, 202, 0.1)',
        filePath: colorFilePath
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

describe('test dealFade', () => {
  it('should return new value', () => {
    const colorToVar = utils.getColorMapFromFiles([path.resolve(__dirname, './less/color-var.less')])
    const color = utils.parseColor('rgba(0, 170, 17, 0.1)')
    const fadeResult = utils.dealFade('solid 1px ', 'rgba(0, 170, 17, 0.1)', '', color, colorToVar, constant.Syntax.LESS)
    expect(fadeResult.fadeValue).toBe('solid 1px fade(@short-hex, 10%)')
    expect(fadeResult.notAlphaColorVar.id).toBe('0-170-17-1')

  })

  it('should return undefined', () => {
    const colorToVar = utils.getColorMapFromFiles([path.resolve(__dirname, './less/color-var.less')])
    const color = utils.parseColor('#bbb')
    expect(utils.dealFade('solid 1px ', '#bbb', '', color, colorToVar, constant.Syntax.LESS)).toBe(undefined)
    expect(utils.dealFade('solid 1px ', 'rgba(0, 170, 17, 1)', '', color, colorToVar, constant.Syntax.LESS)).toBe(undefined)
  })
})

describe('test replaceColor', () => {
  const colorFilePath = path.resolve(__dirname, './less/color-var.less')
  const colorBasic = [
    {
      type: constant.COLOR_TYPE.SHORTCUT_HEX,
      r: 0,
      g: 170,
      b: 17,
      a: 1,
      name: 'short-hex-color',
      param: '#0a1',
      filePath: colorFilePath
    }, {
      type: constant.COLOR_TYPE.HEX,
      r: 255,
      g: 255,
      b: 255,
      a: 1,
      name: 'white',
      param: '#ffffff',
      filePath: colorFilePath
    }, {
      type: constant.COLOR_TYPE.RGBA,
      r: 66,
      g: 139,
      b: 202,
      a: 0.1,
      name: 'rgba-color',
      param: 'rgba(66, 139, 202, 0.1)',
      filePath: colorFilePath
    },
    {
      type: constant.COLOR_TYPE.RGBA,
      r: 66,
      g: 139,
      b: 202,
      a: 1,
      name: 'rgb-color',
      param: 'rgb(66, 139, 202)',
      filePath: colorFilePath
    }
  ]
  const colorToVar = colorBasic.reduce((map, color) => {
    const c = utils.appendId(color)
    map[c.id] = c
    return map
  }, {})

  it('should replace success when one hex  color', () => {
    expect(utils.replaceColor('solid 1px #0a1', colorToVar)).toEqual({
      value: 'solid 1px @short-hex-color',
      notFoundColors: [],
      isMatchColor: true,
      needFileMap: {
        [colorFilePath]: true
      }
    })
    expect(utils.replaceColor('solid 1px #ffffff', colorToVar)).toEqual({
      value: 'solid 1px @white',
      notFoundColors: [],
      isMatchColor: true,
      needFileMap: {
        [colorFilePath]: true
      }
    })
  })

  it('should replace success when one rgb,rgba  color', () => {
    expect(utils.replaceColor('solid 1px rgba(66, 139, 202, 0.1)', colorToVar)).toEqual({
      value: 'solid 1px @rgba-color',
      notFoundColors: [],
      isMatchColor: true,
      needFileMap: {
        [colorFilePath]: true
      }
    })
    expect(utils.replaceColor('solid 1px rgb(66, 139, 202)', colorToVar)).toEqual({
      value: 'solid 1px @rgb-color',
      notFoundColors: [],
      isMatchColor: true,
      needFileMap: {
        [colorFilePath]: true
      }
    })
  })

  it('should replace success when one line has multiple  color', () => {
    expect(utils.replaceColor('linear-gradient(#0a1 0%, #ffffff 100%)', colorToVar))
      .toEqual({
        value: 'linear-gradient(@short-hex-color 0%, @white 100%)',
        notFoundColors: [],
        isMatchColor: true,
        needFileMap: {
          [colorFilePath]: true
        }
      })
  })

  it('should return right notFoundColor', () => {
    expect(utils.replaceColor('linear-gradient(#aaa 0%, #bbb 100%)', colorToVar))
      .toEqual({
        value: 'linear-gradient(#aaa 0%, #bbb 100%)',
        notFoundColors: ['#aaa', '#bbb'],
        isMatchColor: true,
        needFileMap: {}
      })

    expect(utils.replaceColor('linear-gradient(#000 0%, #ffffff 100%)', colorToVar))
      .toEqual({
        value: 'linear-gradient(#000 0%, @white 100%)',
        notFoundColors: ['#000'],
        isMatchColor: true,
        needFileMap: {
          [colorFilePath]: true
        }
      })

    expect(utils.replaceColor('solid 1px rgba(0,0,0,0.1)', colorToVar, constant.Syntax.LESS)).toEqual({
      value: 'solid 1px rgba(0,0,0,0.1)',
      notFoundColors: ['rgba(0,0,0,0.1)'],
      isMatchColor: true,
      needFileMap: {}
    })
  })

  it('should replace success when need fade color', () => {
    expect(utils.replaceColor('solid 1px rgba(255,255,255,0.1)', colorToVar, constant.Syntax.LESS)).toEqual({
      value: 'solid 1px fade(@white, 10%)',
      notFoundColors: [],
      isMatchColor: true,
      needFileMap: {
        [colorFilePath]: true
      }
    })
  })

  it('should return origin when not color found', () => {
    expect(utils.replaceColor('blue', colorToVar))
      .toEqual({
        value: 'blue',
        notFoundColors: [],
        isMatchColor: false,
        needFileMap: {}
      })
  })
})
