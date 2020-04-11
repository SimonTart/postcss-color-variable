# PostCSS Color Variable

[PostCSS] plugin color variable. 替换less当中的颜色值为预定义的变量

[PostCSS]: https://github.com/postcss/postcss
定义颜色文件
```less
@link-color: #0a1;
```

输入
```less
.foo {
    color: #0a1;
}
```

输出
```less
.foo {
  color: @link-color;
}
```

## 用法

### 创建配置文件
项目中创建.colorvarrc.json
```json
{
  "variableFiles": ["./src/color.less"] // 定义变量的文件
}
```

### 通过命令替换指定文件
```bash
# 安装插件
npm install postcss-color-variable --save-dev
# 通过命令替换
./node_modules/.bin/postcss-color-variable src/index.less
```

### 在VSCode中通过插件替换
https://marketplace.visualstudio.com/items?itemName=zengxb94.color-variable&ssr=false#overview

### 在WebStrom中使用
1. 安装插件
```bash
npm install postcss-color-variable --save-dev
```
2. Preferences -> File Watchers -> Add Custom
3. 配置参数：
  - File Type: Less Style Sheet
  - Program: $ProjectFileDir$/node_modules/.bin/postcss-color-variable
  - Arguments: $FilePathRelativeToProjectRoot$
  - Working Directory: $ProjectFileDir$
