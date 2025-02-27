// test-babel.js
const babel = require("@babel/core");
const fs = require("fs");
const path = require("path");

// 读取一个 Vue 文件来测试
const filePath = path.join(__dirname, "src/components/TestI18n.vue");
const code = fs.readFileSync(filePath, "utf-8");

// 开启调试模式
process.env.DEBUG = "babel-plugin:i18n";

// 转换代码
babel.transform(
  code,
  {
    filename: filePath,
    plugins: [
      [
        "./build/auto-i18n-plugin.js",
        {
          outputDir: "./src/locales",
          prefix: "i18n_",
        },
      ],
    ],
  },
  (err, result) => {
    if (err) {
      console.error("Transform error:", err);
    } else {
      console.log("Transformed code:", result.code);
    }
  }
);
