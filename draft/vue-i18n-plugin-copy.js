// build/vue-i18n-plugin.js
const { parse, compileTemplate } = require('@vue/compiler-sfc');
const fs = require('fs');
const path = require('path');

class VueI18nPlugin {
  constructor(options = {}) {
    this.options = options;
    this.translations = new Map();
  }

  apply(compiler) {
    compiler.hooks.emit.tapAsync('VueI18nPlugin', (compilation, callback) => {
      // 遍历所有编译后的资源
      compilation.modules.forEach(module => {
        if (module.resource && module.resource.endsWith('.vue')) {
          const source = fs.readFileSync(module.resource, 'utf8');
          const { descriptor } = parse(source);
          
          if (descriptor.template) {
            const template = descriptor.template.content;
            
            // 使用编译器处理模板
            const { ast } = compileTemplate({
              source: template,
              filename: module.resource,
              id: module.resource
            });

            // 遍历AST，提取中文文本
            this.traverseAst(ast, module.resource);
          }
        }
      });

      // 输出翻译文件
      this.writeTranslations();
      
      callback();
    });
  }

  traverseAst(ast, filename) {
    if (!ast) return;

    // 检查文本节点
    if (ast.type === 'text' && /[\u4e00-\u9fa5]/.test(ast.content)) {
      const texts = this.translations.get(filename) || new Set();
      texts.add(ast.content.trim());
      this.translations.set(filename, texts);
    }

    // 递归遍历子节点
    if (ast.children) {
      ast.children.forEach(child => this.traverseAst(child, filename));
    }
  }

  writeTranslations() {
    const output = {};
    this.translations.forEach((texts, filename) => {
      output[filename] = Array.from(texts);
    });

    const outputPath = path.join(this.options.outputDir || './src/locales', 'vue-translations.json');
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));
  }
}

module.exports = VueI18nPlugin;