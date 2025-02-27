// transform.js
const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");
const { parse } = require("@vue/compiler-sfc");

// 处理单个文件
async function transformFile(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  let result;

  if (filePath.endsWith(".vue")) {
    // 处理 Vue 文件
    const { descriptor } = parse(content);

    // 处理 template 中的文本
    if (descriptor.template) {
      const templateContent = descriptor.template.content;
      const transformedTemplate = await babel.transformAsync(templateContent, {
        plugins: ["./babel-plugin-chinese-to-pinyin"],
        parserOpts: {
          plugins: ["jsx"],
        },
      });
      descriptor.template.content = transformedTemplate.code;
    }

    // 处理 script 中的文本
    if (descriptor.script) {
      const scriptContent = descriptor.script.content;
      const transformedScript = await babel.transformAsync(scriptContent, {
        plugins: ["./babel-plugin-chinese-to-pinyin"],
      });
      descriptor.script.content = transformedScript.code;
    }

    // 重新组合 Vue 文件
    result = {
      code: `
        <template>
          ${descriptor.template ? descriptor.template.content : ""}
        </template>
        <script>
          ${descriptor.script ? descriptor.script.content : ""}
        </script>
        <style>
          ${descriptor.styles.map((style) => style.content).join("\n")}
        </style>
      `,
    };
  } else {
    // 处理 JS 文件
    result = await babel.transformAsync(content, {
      plugins: ["./babel-plugin-chinese-to-pinyin"],
    });
  }

  // 写入转换后的内容
  fs.writeFileSync(filePath, result.code);
  console.log(`Transformed: ${filePath}`);
}

// 递归处理目录
async function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);

  for (const file of files) {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      await processDirectory(fullPath);
    } else if (file.endsWith(".js") || file.endsWith(".vue")) {
      await transformFile(fullPath);
    }
  }
}

// 开始处理
const srcDir = path.resolve(__dirname, "src");
processDirectory(srcDir).catch(console.error);
