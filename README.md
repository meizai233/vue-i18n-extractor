# vue-i18n-extractor

vue-i18n-extractor 是一款专为 Vue.js 项目设计的自动化国际化工具，能够智能识别并提取项目中的中文文本，自动转换为 vue-i18n 标准的 $t('key') 形式，同时将所有提取的文本集中管理并保存到本地化 JSON 文件中。

## 该 demo 仅供测试

## 功能特点

- **完全无侵入式**：不会修改任何源代码文件，开发人员可以继续使用中文开发，无需关心国际化过程
- **智能中文识别**：自动扫描项目中的 .vue、.js 文件中的中文字符串
- **代码自动转换**：将硬编码的中文文本替换为标准的 `$t('key')` 国际化调用形式
- **JSON 文件管理**：自动收集并组织所有提取的文本到结构化的本地化文件
- **Webpack 深度集成**：作为构建流程的一部分，无需额外工具链

## 解决痛点

- 消除手动复制粘贴中文到语言文件的繁琐工作
- 减少国际化改造过程中的人为错误

## 适用场景

- 现有中文 Vue 项目需要快速改造为多语言支持

## Project setup

```
pnpm install
```

### Compiles and hot-reloads for development

```
pnpm run serve
```

### Compiles and minifies for production

```
pnpm run build
```

### Lints and fixes files

```
pnpm run lint
```

### Customize configuration

See [Configuration Reference](https://cli.vuejs.org/config/).
