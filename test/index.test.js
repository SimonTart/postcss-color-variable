let postcss = require('postcss')
let path = require('path')
let plugin = require('../src/index')

async function run (input, output, opts) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.content).toBe(output)
  expect(result.warnings()).toHaveLength(0)
}

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
    border: 1px solid #0a1;
  }
}
    `, { variables: [path.resolve(__dirname, './less/color-var.less')] })
})
