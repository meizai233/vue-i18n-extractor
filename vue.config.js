const { defineConfig } = require("@vue/cli-service");
const { watch } = require("fs");
const path = require("path");

// 需要关注
// loader的放置位置，

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    // 当 webpack 遇到一个 .js 文件时，它会查找 module.rules 中哪条规则的 test 条件匹配 .js，然后应用该规则中定义的 loader 来处理这个文件。
    // 规定如何处理每一个模块【可以理解为文件？】, 定义一处理js的规则链
    // 定义一个处理js的链路 使用i18插件
    // ??? 为什么要放在babel-loader前 babel-loader做了啥
    config.module.rule("js").include.add(path.resolve(__dirname, "src")).end().use("i18-auto-webpack").loader(path.resolve(__dirname, "./i18n-auto-webpack/loader")).before("babel-loader").end();

    // 如果是开发环境，生成国际化词条配置文件
    if (process.env.NODE_ENV === "development") {
      config.plugin("i18n-auto-webpack").use(path.resolve(__dirname, "./i18n-auto-webpack/plugin"), [
        {
          watch: true,
        },
      ]);
    }
  },
});
