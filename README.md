# PostCSS Color Variable

[PostCSS] plugin color variable. Replace color value with color variable name

[PostCSS]: https://github.com/postcss/postcss
color variable definition file
```less
@link-color: #0a1;
```

input less file
```less
.foo {
    color: #0a1;
}
```
output less file
```css
.foo {
  color: @link-color;
}
```

## Usage

Install plugin
```bash
npm install postcss-color-variable --save-dev
```

If you already use PostCSS, add the plugin to plugins list:
Check you project for existed PostCSS config: `postcss.config.js`
in the project root, `"postcss"` section in `package.json`
or `postcss` in bundle config.

```diff
module.exports = {
  plugins: [
+   require('postcss-color-variable'),
  ]
}
```

## Options
```js
{
  variables: ['/test/color.less'] // color definition file absolute path
}
```

## Support
only support Less

