const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");
const { baseParse, transform } = require("@vue/compiler-core");
const { pinyin } = require("pinyin");
const generate = require("@babel/generator").default;

/**
 * Converts Chinese characters to their first 5 pinyin letters
 * @param {string} text - Text containing Chinese characters
 * @returns {string} Text with Chinese replaced by pinyin (first 5 letters)
 */
function chineseToPinyinKey(text) {
  // 清理文本，移除空格和标点
  const cleanText = text.trim().replace(/[^\u4e00-\u9fa5a-zA-Z0-9]/g, "");

  // 转换为拼音并限制长度
  const pinyinResult = pinyin(cleanText, {
    style: pinyin.STYLE_NORMAL,
    heteronym: false,
  })
    .flat()
    .join("_");

  return pinyinResult;
}
function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

function createTransformer(i18nMap = {}) {
  return {
    nodeTransforms: [
      (node) => {
        if (node.type === 1) {
          // 处理元素上的属性
          if (node.props) {
            node.props.forEach((prop) => {
              // 处理静态属性值中的中文
              if (prop.type === 6 && prop.value && /[\u4e00-\u9fa5]/.test(prop.value.content)) {
                const chineseText = prop.value.content;
                const key = chineseToPinyinKey(chineseText);
                i18nMap[key] = chineseText;
                prop.value.content = `{{ $t('${key}') }}`;
              }

              // 处理动态绑定中可能的中文字符串字面量
              if (prop.type === 7 && prop.exp && prop.exp.type === 4) {
                // 这里需要更复杂的表达式解析，简化示例
              }
            });
          }
        }

        if (node.type === 2 && isChinese(node.content)) {
          const chineseText = node.content.trim();
          if (chineseText) {
            const key = chineseToPinyinKey(chineseText);
            i18nMap[key] = chineseText;
            // 修改为使用国际化函数
            node.content = `{{ $t('${key}') }}`;
          }
        }

        // 处理插值表达式中的中文字符串字面量
        if (node.type === 5 && node.content.type === 4 && typeof node.content.content === "string" && /[\u4e00-\u9fa5]/.test(node.content.content)) {
          const chineseText = node.content.content.trim();
          const key = chineseToPinyinKey(chineseText);
          i18nMap[key] = chineseText;
          node.content.content = `$t('${key}')`;
        }
      },
    ],
  };
}

function processVueFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");

  const ast = baseParse(content);

  transform(ast, createTransformer());
  // const { code } = codegen(ast);
  const { code } = generate(ast, {
    retainLines: true,
    compact: false,
    // 可以根据需要配置更多选项
  });
  debugger;
}

function processProject(projectPath) {
  const vueFiles = glob.sync(path.join(projectPath, "**/*.vue"));
  const jsFiles = glob.sync(path.join(projectPath, "**/*.js"));

  console.log(`Found ${vueFiles.length} Vue files and ${jsFiles.length} JS files`);

  vueFiles.forEach(processVueFile);
  // jsFiles.forEach(processJsFile);

  console.log("Transformation complete!");
}

processVueFile("/Users/suda/Documents/work/study/DemoWorkspace/learn-babel/i18n-test/src/components/TestI18n copy.vue");
// module.exports = {
//   processProject,
//   chineseToPinyin,
// };
