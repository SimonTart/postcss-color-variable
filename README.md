# PostCSS Color Variable

[PostCSS] plugin color variable. 替换颜色值为预定义的变量。目前只支持Less

[PostCSS]: https://github.com/postcss/postcss

定义颜色变量名的文件
```less
@link-color: #0a1;
```

输入
```less
.foo {
    color: #0a1;
    background: rgb(170, 170, 170);
    border: 1px solid rgba(170, 170, 170, 0.1);
}
```

输出
```less
.foo {
  color: @link-color;
  background: @link-color;
  border: 1px solid fade(@link-color, 10%);
}
```

## 配置

项目中创建.colorvarrc.json
```json
{
  "variableFiles": ["./src/color.less"], // 定义颜色变量的文件
  "syntax": "less", // 语法 less 目前只支持 less
  "autoImport": "true", // 是否自动导入依赖的 variableFile
  "alias": {
    "@": "./src" // 等同于 webpack 中的alias
  },
  "usingAlias": "@", // 自动导入 variableFile 时，使用 alias ，例如 @import '~@/src/color.less'
  "singleQuote": false, // 自动导入时是否使用单引号， 默认 false
}
```

## 使用
### 命令行
```bash
# 安装插件
npm install postcss-color-variable --save-dev
# 通过命令替换
./node_modules/.bin/postcss-color-variable src/index.less
```

### VSCode插件
https://marketplace.visualstudio.com/items?itemName=zengxb94.color-variable&ssr=false#overview

### WebStorm中使用
1. 安装依赖
```bash
npm install postcss-color-variable --save-dev
```
2. Preferences -> File Watchers -> Add Custom
3. 配置参数：
  - File Type: Less Style Sheet
  - Program: $ProjectFileDir$/node_modules/.bin/postcss-color-variable
  - Arguments: $FilePathRelativeToProjectRoot$
  - Working Directory: $ProjectFileDir$
