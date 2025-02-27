// ???这是什么阶段
const { parse, compileTemplate } = require("@vue/compiler-sfc");
const fs = require("fs");
const path = require("path");
const { pinyin } = require("pinyin");

class VueI18nPlugin {
  constructor(options = {}) {
    this.options = options;
    this.translations = new Map();
  }

  // apply(compiler) {
  //   // 初始化compilation 此时应该还没有make？能拿到什么
  //   compiler.hooks.compilation.tapAsync("VueI18nPlugin", (compilation, callback) => {
  //     // 为什么是在这个钩子？详细说一下
  //     debugger;
  //     compilation.modules.forEach((module) => {
  //       // debugger
  //       if (module.resource && module.resource.endsWith(".vue")) {
  //         const source = fs.readFileSync(module.resource, "utf8");
  //         const { descriptor } = parse(source);

  //         if (descriptor.template) {
  //           const template = descriptor.template.content;

  //           // 使用编译器处理模板
  //           const { ast } = compileTemplate({
  //             source: template,
  //             filename: module.resource,
  //             id: module.resource,
  //           });

  //           // 遍历AST，提取中文文本
  //           this.traverseAst(ast, module.resource);
  //         }
  //       }
  //     });
  //     this.saveTranslations();
  //     callback();
  //   });
  // }

  apply(compiler) {
    compiler.hooks.compilation.tap("VueI18nPlugin", (compilation) => {
      compilation.hooks.processAssets.tapAsync(
        {
          name: "VueI18nPlugin",
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets, callback) => {
          debugger;
          console.log("Processing assets..."); // 调试日志
          // console.log(assets);
          // debugger;
          callback();
        }
      );
    });
  }

  // 解析模板的方法
  parseTemplate(source) {
    // 你需要使用合适的解析器，例如 @vue/compiler-sfc
    const { parse } = require("@vue/compiler-sfc");
    const parsed = parse(source);

    if (!parsed.descriptor.template) {
      console.log("No template found in component"); // 调试日志
      return null;
    }

    return parsed.descriptor.template.ast;
  }

  traverseAst(ast, filename) {
    if (!ast) return;

    if (ast.type === 2 && /[\u4e00-\u9fa5]/.test(ast.content)) {
      const originalContent = ast.content.trim();
      const pinyinResult = this.getpinyinResult(originalContent);

      // 检查该拼音是否已存在
      if (!this.translations.has(pinyinResult)) {
        // 只有当拼音不存在时，才添加新的键值对
        this.translations.set(pinyinResult, originalContent);
      }
      ast.content = `{{ $t('${pinyinResult}') }}`;
    }

    // 递归遍历子节点
    if (ast.children) {
      ast.children.forEach((child) => this.traverseAst(child, filename));
    }
  }

  async saveTranslations() {
    // debugger;
    try {
      // 确保 locales 目录存在
      if (!fs.existsSync("locales")) {
        fs.mkdirSync("locales", { recursive: true });
      }

      const translations = Object.fromEntries(this.translations);
      const content = JSON.stringify(translations, null, 2);

      // 使用同步方法写入文件
      fs.writeFileSync("locales/zh.json", content);
      fs.writeFileSync("locales/en.json", content);

      console.log("Translations saved successfully");
    } catch (error) {
      console.error("Error saving translations:", error);
      throw error;
    }
  }

  getpinyinResult(content) {
    // 将中文转换为拼音，取前5个字并用下划线连接
    const pinyinResult = pinyin(content, {
      style: pinyin.STYLE_NORMAL, // 使用普通风格的拼音
      segment: true, // 启用分词
    }).flat(); // 将嵌套数组展平

    // 获取前5个拼音并用下划线连接
    const pinyinKey = pinyinResult
      .slice(0, 5) // 取前5个
      .join("_"); // 用下划线连接

    return pinyinKey;
  }
}

module.exports = VueI18nPlugin;
