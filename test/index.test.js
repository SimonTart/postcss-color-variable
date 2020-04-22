const postcss = require('postcss')
const path = require('path')
const lessSyntax = require('postcss-less')

const constant = require('../src/constant')
const plugin = require('../src/index')

async function run (input, output, opts) {
  const result = await postcss([plugin(opts)]).process(input, {
    from: undefined,
    syntax: constant.ParserMap[opts.syntax || constant.Syntax.less]
  })
  expect(result.content).toBe(output)
  expect(result.warnings()).toHaveLength(0)
}

describe('test postcss replace plugin', () => {
  it('should replace right', async () => {
    await run(`
a {
  color: red;
  background: #0a1;

  b {
    color: blue;
    background: rgba(66, 139, 202, 0.1);
    border: 1px solid #0a1;
  }
}
    `,
      `
a {
  color: red;
  background: @short-hex;

  b {
    color: blue;
    background: @link-color;
    border: 1px solid @short-hex;
  }
}
    `, { variableFiles: [path.resolve(__dirname, './less/color-var.less')] })
  })
})

describe('test postcss using config function', () => {
  it('should replace right when using rc config', async () => {
    await run(
      `
a {
  color: red;
  background: #0a1;
}
    `,

      `
a {
  color: red;
  background: @short-hex;
}
    `, {
        searchFrom: path.resolve(__dirname, './less/index.less')
      })
  })
})

describe('test postcss warning function', () => {
  it('should have warning', async () => {
    let result = await postcss(
      [
        plugin({
          variableFiles: [path.resolve(__dirname, './less/color-var.less')]
        })
      ]
    ).process(
      `
        .a {
          .c();
          background: linear-gradient(#aaa 0%, #bbb 100%);
        }
      `
      , {
        from: undefined,
        syntax: lessSyntax
      })
    expect(result.warnings()[0].text).toBe('#aaa,#bbb 找不到对应颜色变量')
  })
})

describe('test plugin auth import file function', () => {
  it('not import file when file already imported', async () => {
    const input = `
@import "./utils.less";
@import "../less/color-var.less";
a {
  color: red;
  background: #0a1;
}
    `
    const output = `
@import "./utils.less";
@import "../less/color-var.less";
a {
  color: red;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [path.resolve(__dirname, './less/color-var.less')],
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import need file after imported file', async () => {
    const input = `
@import "./utils.less";
a {
  color: red;
  background: #0a1;
}
    `
    const output = `
@import "./utils.less";
@import "../less/color-var.less";
a {
  color: red;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [path.resolve(__dirname, './less/color-var.less')],
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import need file success on file first line', async () => {
    const input = `
a {
  color: red;
  background: #0a1;
}
    `
    const output = `
@import "../less/color-var.less";
a {
  color: red;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [path.resolve(__dirname, './less/color-var.less')],
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import one file when already import one need file', async () => {
    const input = `
@import "../less/color-var.less";
a {
  color: #ff0000;
  background: #0a1;
}
    `
    const output = `
@import "../less/color-var.less";
@import "../less/color-var2.less";
a {
  color: @red-color;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [
        path.resolve(__dirname, './less/color-var.less'),
        path.resolve(__dirname, './less/color-var2.less')
      ],
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import multiple file', async () => {
    const input = `
a {
  color: #ff0000;
  background: #0a1;
}
    `
    const output = `
@import "../less/color-var.less";
@import "../less/color-var2.less";
a {
  color: @red-color;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [
        path.resolve(__dirname, './less/color-var.less'),
        path.resolve(__dirname, './less/color-var2.less')
      ],
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('not import file when file already imported by alias', async () => {
    const input = `
@import "~@/less/color-var.less";
@import "~@/less/color-var2.less";
a {
  color: #ff0000;
  background: #0a1;
}
    `
    const output = `
@import "~@/less/color-var.less";
@import "~@/less/color-var2.less";
a {
  color: @red-color;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [
        path.resolve(__dirname, './less/color-var.less'),
        path.resolve(__dirname, './less/color-var2.less')
      ],
      alias: {
        '@': path.resolve(__dirname),
      },
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import file using relative path', async () => {
    const input = `
@import "~@/less/color-var.less";
a {
  color: #ff0000;
  background: #0a1;
}
    `
    const output = `
@import "~@/less/color-var.less";
@import "../less/color-var2.less";
a {
  color: @red-color;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [
        path.resolve(__dirname, './less/color-var.less'),
        path.resolve(__dirname, './less/color-var2.less')
      ],
      alias: {
        '@': path.resolve(__dirname),
      },
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import file using absolute path', async () => {
    const input = `
@import "~@/less/color-var.less";
a {
  color: #ff0000;
  background: #0a1;
}
    `
    const output = `
@import "~@/less/color-var.less";
@import "~@/less/color-var2.less";
a {
  color: @red-color;
  background: @short-hex;
}
    `
    await run(input, output, {
      autoImport: true,
      variableFiles: [
        path.resolve(__dirname, './less/color-var.less'),
        path.resolve(__dirname, './less/color-var2.less')
      ],
      alias: {
        '@': path.resolve(__dirname),
      },
      usingAlias: '@',
      sourcePath: path.resolve(__dirname, './src/index.less')
    })
  })

  it('auto import file using absolute path when in sass', async () => {
    const input = `
@import "~@/sass/color-var.scss";
a {
  color: #ff0000;
  background: #0a1;
}
    `
    const output = `
@import "~@/sass/color-var.scss";
@import "~@/sass/color-var2.scss";
a {
  color: $red-color;
  background: $short-hex;
}
    `
    await run(input, output, {
      syntax: constant.Syntax.scss,
      autoImport: true,
      variableFiles: [
        path.resolve(__dirname, './sass/color-var.scss'),
        path.resolve(__dirname, './sass/color-var2.scss')
      ],
      alias: {
        '@': path.resolve(__dirname),
      },
      usingAlias: '@',
      sourcePath: path.resolve(__dirname, './src/index.scss')
    })
  })
})
