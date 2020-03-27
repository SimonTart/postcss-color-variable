let postcss = require('postcss')

let plugin = require('../src/index')

async function run (input, output, opts) {
  let result = await postcss([plugin(opts)]).process(input, { from: undefined })
  expect(result.css).toEqual(output)
  expect(result.warnings()).toHaveLength(0)
}

it('should replace right', async () => {
  await run(`
    a {
      color: red;

      b {
        color: blue;
      }
    }
  `, 'a{ }', { })
})
