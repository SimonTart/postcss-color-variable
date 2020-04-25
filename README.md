# PostCSS Color Variable
[EN](./README) | [ZH](./zh.md)

[PostCSS] plugin color variable. Auto replace color value with corresponding variable name. Now support Less and Sass

Define color variable name file:
```less
@link-color: #0a1;
```

Input:
```less
.foo {
    color: #0a1;
    background: rgb(170, 170, 170);
    border: 1px solid rgba(170, 170, 170, 0.1);
}
```

Output:
```less
.foo {
  color: @link-color;
  background: @link-color;
  border: 1px solid fade(@link-color, 10%);
}
```

## Config
Create file `.colorvarrc.json` in project.
```js
{
  "variableFiles": ["./src/color.less"], // define color variable file path
  "syntax": "less", // syntax，support less, sass. default is less
  "autoImport": "true", // if auto import variable file
  "alias": {
    "@": "./src" // equal webpack alias
  },
  "usingAlias": "@", // when auto import variable file, using alias. for example @import '~@/src/color.less'
  "singleQuote": false, // auto import if using single quote. default is false
}
```

## Use
### CLI
```bash
# install plugin
npm install postcss-color-variable --save-dev
# auto replace by cli
./node_modules/.bin/postcss-color-variable src/index.less

# set syntax by --syntax
./node_modules/.bin/postcss-color-variable src/index.scss --syntax scss
```

### VSCode Extension
https://marketplace.visualstudio.com/items?itemName=zengxb94.color-variable&ssr=false#overview

### Use in WebStorm
#### WebStorm replace Less file
1. Install plugin: `npm install postcss-color-variable --save-dev`
2. Open `Preferences -> File Watchers -> Add`
3. Settings
  - Name: `Color Variable Less`
  - File type: `Less Style Sheet`
  - Program: `$ProjectFileDir$/node_modules/.bin/postcss-color-variable`
  - Arguments: `$FilePathRelativeToProjectRoot$`
  - Output paths to refresh: `$FilePathRelativeToProjectRoot$`
  - Working Directory: `$ProjectFileDir$`
  - set Auto-save edited files to trigger watcher  unchecked
  - set Trigger The watcher on external changes unchecked


### WebStorm replace Sass file
1. Install plugin: `npm install postcss-color-variable --save-dev`
2. Open `Preferences -> File Watchers -> Add`
3. Settings
  - Name: `Color Variable Sass`
  - File type: `Sass Style Sheet`
  - Program: `$ProjectFileDir$/node_modules/.bin/postcss-color-variable`
  - Arguments: `$FilePathRelativeToProjectRoot$`
  - Output paths to refresh: `$FilePathRelativeToProjectRoot$`
  - Working Directory: `$ProjectFileDir$`
  - set Auto-save edited files to trigger watcher  unchecked
  - set Trigger The watcher on external changes unchecked
