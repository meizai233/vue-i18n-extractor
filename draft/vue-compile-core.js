const { parse, transform, createRoot } = require("@vue/compiler-core");
const pinyin = require("pinyin");
const fs = require("fs");
const path = require("path");
const glob = require("glob");

/**
 * 将中文转换为拼音格式的国际化键
 * @param {string} text - 中文文本
 * @returns {string} 转换后的拼音格式键名
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

/**
 * 创建转换插件
 * @param {Object} i18nMap - 存储国际化键值对的对象
 * @returns {Object} transformer 插件
 */
function createTransformer(i18nMap = {}) {
  return {
    nodeTransforms: [
      // 处理元素节点
      (node) => {
        if (node.type === 1) {
          // 元素节点
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

        // 处理文本节点
        if (node.type === 2 && /[\u4e00-\u9fa5]/.test(node.content)) {
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

/**
 * 处理单个Vue文件
 * @param {string} filePath - Vue文件路径
 * @param {Object} i18nMap - 存储国际化键值对的对象
 */
function processVueFile(filePath, i18nMap) {
  const content = fs.readFileSync(filePath, "utf-8");

  // 提取模板部分
  const templateMatch = content.match(/<template>([\s\S]*)<\/template>/);
  if (!templateMatch) {
    console.log(`No template found in ${filePath}`);
    return;
  }

  const templateContent = templateMatch[1];

  // 解析模板
  const ast = parse(templateContent);

  // 转换AST
  const transformer = createTransformer(i18nMap);
  transform(ast, transformer);

  // 在实际应用中，这里需要生成新的模板内容并替换原文件中的模板部分
  console.log(`Processed ${filePath}`);
}

/**
 * 生成国际化语言文件
 * @param {Object} i18nMap - 存储国际化键值对的对象
 * @param {string} outputPath - 输出文件路径
 */
function generateI18nFile(i18nMap, outputPath) {
  const content = JSON.stringify(i18nMap, null, 2);
  fs.writeFileSync(outputPath, content, "utf-8");
  console.log(`Generated i18n file at ${outputPath}`);
}

/**
 * 处理整个项目
 * @param {string} projectPath - 项目路径
 * @param {string} outputPath - 输出国际化文件路径
 */
function processProject(projectPath, outputPath = "./src/locales/zh.json") {
  const vueFiles = glob.sync(path.join(projectPath, "**/*.vue"));
  console.log(`Found ${vueFiles.length} Vue files`);

  const i18nMap = {};

  vueFiles.forEach((file) => {
    processVueFile(file, i18nMap);
  });

  // 确保输出目录存在
  const outputDir = path.dirname(outputPath);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  generateI18nFile(i18nMap, outputPath);

  console.log("Extraction complete!");
  return i18nMap;
}

// 使用示例
// processProject('./src', './src/locales/zh.json');

module.exports = {
  processProject,
  processVueFile,
  chineseToPinyinKey,
};
