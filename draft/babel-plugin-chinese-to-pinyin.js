const pinyin = require("pinyin");

module.exports = function (babel) {
  const { types: t } = babel;

  return {
    name: "chinese-to-pinyin",

    visitor: {
      TemplateLiteral(path) {
        debugger;
      },
    },
  };
};
