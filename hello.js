const { baseParse, transform, generate } = require("@vue/compiler-core");

// 解析模板为 AST
const ast = baseParse("<div>Hello World</div>");

// 转换 AST
transform(ast, {
  // 可选的转换选项
});

// 从 AST 生成渲染函数代码
const { code } = generate(ast);
