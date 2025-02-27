const { declare } = require("@babel/helper-plugin-utils");
const fs = require("fs");
const pth = require("path");
const debug = require("debug")("babel-plugin:i18n");

// 检查是否为中文字符
function isChinese(text) {
  return /[\u4e00-\u9fa5]/.test(text);
}

module.exports = declare((api, options = {}) => {
  const { outputDir = "./src/locales", prefix = "i18n_" } = options;

  // 用于存储收集到的模板字符串
  let collectedElements = new Set();

  return {
    name: "auto-i18n",
    pre() {
      // 在处理文件前初始化收集器
      collectedElements.clear();
      console.log("=== Auto I18n Plugin Started ===");
    },
    visitor: {
      Program: {
        enter(path, state) {
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
            console.log("Created output directory:", outputDir);
          }
        },
        exit(path, state) {
          // 在处理完文件后进行写入
          const currentFile = state.file.opts.filename;
          const relativePath = pth.relative(process.cwd(), currentFile);

          if (collectedElements.size > 0) {
            const outputFile = pth.resolve(outputDir, "template-elements.json");

            // 读取现有内容（如果存在）
            let existingData = {};
            if (fs.existsSync(outputFile)) {
              try {
                existingData = JSON.parse(fs.readFileSync(outputFile, "utf8"));
              } catch (e) {
                console.warn("Failed to parse existing file:", e);
              }
            }

            // 更新数据
            existingData[relativePath] = Array.from(collectedElements);

            // 写入文件
            fs.writeFileSync(outputFile, JSON.stringify(existingData, null, 2), "utf8");

            console.log(`Updated translations for ${relativePath}`);
          }

          console.log("=== Finished processing ===");
        },
      },
      TemplateLiteral(path, state) {
        const { node } = path;
        const texts = node.quasis.map((quasi) => quasi.value.raw);

        texts.forEach((text) => {
          // if (isChinese(text)) {
          collectedElements.add(text);
          // }
        });

        // 可以在这里添加源码位置信息
        const location = path.node.loc;
        debug(`Found template literal at line ${location?.start.line}`);
      },
      StringLiteral(path, state) {
        // 这里可以添加对普通字符串的处理
        // 比如检测中文字符等
      },
    },
  };
});
