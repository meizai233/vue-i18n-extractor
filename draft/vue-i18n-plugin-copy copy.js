class VueI18nPlugin {
  constructor() {
    this.translations = new Map();
  }

  apply(compiler) {
    // 使用 compilation 钩子来处理文件
    compiler.hooks.compilation.tap("VueI18nPlugin", (compilation) => {
      // 添加对 vue-loader 生成的模块的处理
      compilation.hooks.processAssets.tapAsync(
        {
          name: "VueI18nPlugin",
          stage: compilation.PROCESS_ASSETS_STAGE_ADDITIONS,
        },
        (assets, callback) => {
          console.log("Processing assets..."); // 调试日志

          // 遍历所有资源
          Object.keys(assets).forEach((filename) => {
            if (filename.endsWith(".vue")) {
              console.log("Processing Vue file:", filename); // 调试日志

              const asset = assets[filename];
              const source = asset.source();

              // 打印原始内容
              console.log("Original source:", source);

              try {
                // 解析模板
                const ast = this.parseTemplate(source);
                console.log("AST generated:", !!ast); // 调试日志

                // 遍历和转换
                this.traverseAst(ast, filename);

                // 生成新代码
                const newSource = this.generate(ast);
                console.log("New source generated:", !!newSource); // 调试日志

                // 更新资源
                assets[filename] = {
                  source: () => newSource,
                  size: () => newSource.length,
                };
              } catch (error) {
                console.error("Error processing file:", filename, error);
              }
            }
          });

          // 保存翻译文件
          this.saveTranslations();
          callback();
        }
      );
    });
  }

  traverseAst(ast, filename) {
    if (!ast) {
      console.log("Empty AST received"); // 调试日志
      return;
    }

    // 处理文本节点
    if (ast.type === 2 && /[\u4e00-\u9fa5]/.test(ast.content)) {
      console.log("Found Chinese text:", ast.content); // 调试日志

      const originalContent = ast.content.trim();
      const pinyinResult = this.getpinyinResult(originalContent);

      console.log("Generated pinyin:", pinyinResult); // 调试日志

      if (!this.translations.has(pinyinResult)) {
        this.translations.set(pinyinResult, originalContent);
      }

      // 替换为 $t 形式
      ast.content = `{{ $t('${pinyinResult}') }}`;
      console.log("Replaced with:", ast.content); // 调试日志
    }

    // 递归处理子节点
    if (ast.children) {
      ast.children.forEach((child) => this.traverseAst(child, filename));
    }
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

  // 生成代码的方法
  generate(ast) {
    const { generate } = require("@vue/compiler-sfc");
    return generate(ast).code;
  }
}
