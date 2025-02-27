// babel-plugin-chinese-to-pinyin.js
const pinyin = require("pinyin");

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: "chinese-to-pinyin",
    visitor: {
      // 处理字符串字面量
      StringLiteral(path) {
        const value = path.node.value;
        if (/[\u4e00-\u9fa5]/.test(value)) {
          const pinyinText = pinyin(value, {
            style: pinyin.STYLE_NORMAL,
            segment: true,
          })
            .map((p) => p[0])
            .join("_");
          path.replaceWith(t.stringLiteral(pinyinText));
        }
      },

      // 处理模板字面量
      TemplateLiteral(path) {
        const quasis = path.node.quasis;
        quasis.forEach((quasi) => {
          if (!quasi.value.raw) return;

          if (/[\u4e00-\u9fa5]/.test(quasi.value.raw)) {
            const pinyinText = pinyin(quasi.value.raw, {
              style: pinyin.STYLE_NORMAL,
              segment: true,
            })
              .map((p) => p[0])
              .join("_");
            quasi.value.raw = pinyinText;
            quasi.value.cooked = pinyinText;
          }
        });
      },

      // 处理 JSX 文本
      JSXText(path) {
        const value = path.node.value;
        if (/[\u4e00-\u9fa5]/.test(value)) {
          const pinyinText = pinyin(value.trim(), {
            style: pinyin.STYLE_NORMAL,
            segment: true,
          })
            .map((p) => p[0])
            .join("_");
          path.replaceWith(t.jsxText(pinyinText));
        }
      },
    },
  };
};
