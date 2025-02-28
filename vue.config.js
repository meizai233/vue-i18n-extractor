const { defineConfig } = require("@vue/cli-service");
const { watch } = require("fs");
const path = require("path");
const { addConfig, exsitConfig } = require("./i18n-auto-webpack/common/collect.js");

// 需要关注
// loader的放置位置，

const vueLoaderTap = (options) => {
  options.compilerOptions = options.compilerOptions || {};

  options.compilerOptions.nodeTransforms = options.compilerOptions.nodeTransforms || [];

  options.compilerOptions.nodeTransforms.push((node) => {
    // 处理文本节点
    if (node.type === 2) {
      // Vue 3中文本节点类型为5
      const content = node.content;
      if (typeof content === "string" && /[\u4e00-\u9fa5]/.test(content)) {
        console.log("发现中文文本:", content);

        // 生成唯一key
        const key = `i18n_${Buffer.from(content).toString("hex")}`;

        // 将纯文本节点转换为插值表达式节点
        // 创建一个新的插值节点结构
        const newNode = {
          type: 5, // 插值节点
          content: {
            type: 4, // 简单表达式
            content: `_ctx.$t('${key}')`,
            isStatic: false,
            constType: 0,
            loc: node.loc,
          },
          loc: node.loc,
        };

        // 复制新节点的所有属性到当前节点
        Object.keys(newNode).forEach((key) => {
          node[key] = newNode[key];
        });

        if (!exsitConfig[key] && !addConfig[key]) {
          addConfig[key] = content;
        }

        console.log(`提取纯文本: "${content}" => 键名: "${key}"`);
      }
    }
  });
  return options || {};
};

module.exports = defineConfig({
  transpileDependencies: true,
  chainWebpack: (config) => {
    // 当 webpack 遇到一个 .js 文件时，它会查找 module.rules 中哪条规则的 test 条件匹配 .js，然后应用该规则中定义的 loader 来处理这个文件。
    // 定义一个处理js的流水线 i18n -> babel-loader
    // 首先确保 vue 规则存在
    config.module
      .rule("vue")
      .test(/\.vue$/)
      .use("vue-loader")
      .tap(vueLoaderTap);

    config.module
      .rule("js")
      .include.add(path.resolve(__dirname, "src"))
      .end()
      .use("i18-auto-js")
      .loader(path.resolve(__dirname, "./i18n-auto-webpack/loaders/jsLoader.js"))
      .before("babel-loader")
      .end();

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
