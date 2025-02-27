const { declare } = require('@babel/helper-plugin-utils');
const { parse } = require('@babel/parser');
const fs = require('fs');
const path = require('path');

// 检查是否为中文字符
function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

// 生成唯一的 key
function generateKey(text, prefix = '') {
  const key = text
    .replace(/[\u4e00-\u9fa5]/g, char => char.charCodeAt(0).toString(16))
    .slice(0, 20);
  return `${prefix}${key}`;
}

const autoI18nPlugin = declare((api, options = {}) => {
  const {
    outputDir = './locales',
    prefix = 'i18n_',
    primaryLang = 'zh',
    targetLang = 'en'
  } = options;

  // 存储提取的文本
  const i18nMap = new Map();
  
  return {
    name: 'vue-auto-i18n',
    
    visitor: {
      Program: {
        enter() {
          // 确保输出目录存在
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }
        },
        exit() {
          // 生成语言包文件
          const i18nObject = Object.fromEntries(i18nMap);
          
          // 生成主语言包（中文）
          const primaryLangPath = path.join(outputDir, `${primaryLang}.json`);
          fs.writeFileSync(
            primaryLangPath,
            JSON.stringify(i18nObject, null, 2),
            'utf8'
          );
          
          // 生成目标语言包模板（英文）
          const targetLangPath = path.join(outputDir, `${targetLang}.json`);
          const targetI18nObject = Object.fromEntries(
            Array.from(i18nMap).map(([key]) => [key, ''])
          );
          fs.writeFileSync(
            targetLangPath,
            JSON.stringify(targetI18nObject, null, 2),
            'utf8'
          );
        }
      },
      
      // 处理模板字符串
      TemplateLiteral(path) {
        const { node } = path;
        const texts = node.quasis.map(quasi => quasi.value.raw);
        
        texts.forEach((text, index) => {
          if (isChinese(text)) {
            const key = generateKey(text, prefix);
            i18nMap.set(key, text);
            
            // 替换为 $t 调用
            path.replaceWithSourceString(`this.$t('${key}')`);
          }
        });
      },
      
      // 处理字符串字面量
      StringLiteral(path) {
        const { node } = path;
        if (isChinese(node.value)) {
          const key = generateKey(node.value, prefix);
          i18nMap.set(key, node.value);
          
          // 替换为 $t 调用
          path.replaceWithSourceString(`this.$t('${key}')`);
        }
      },
      
      // 处理 JSX 文本
      JSXText(path) {
        const { node } = path;
        if (isChinese(node.value)) {
          const key = generateKey(node.value.trim(), prefix);
          i18nMap.set(key, node.value.trim());
          
          // 替换为 $t 调用
          path.replaceWithSourceString(`{this.$t('${key}')}`);
        }
      },
      
      // 处理属性值
      ObjectProperty(path) {
        const { node } = path;
        if (
          node.value.type === 'StringLiteral' &&
          isChinese(node.value.value)
        ) {
          const key = generateKey(node.value.value, prefix);
          i18nMap.set(key, node.value.value);
          
          // 替换为 $t 调用
          node.value = parse(`this.$t('${key}')`).program.body[0].expression;
        }
      }
    }
  };
});

module.exports = autoI18nPlugin;