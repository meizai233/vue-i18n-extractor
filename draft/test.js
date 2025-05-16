const { parse } = require("@vue/compiler-dom");

// 示例模板
const templateContent = `<template>
    <div>你好</div>
  </template>`;

// 提取模板部分内容（移除<template>标签）
const templateOnly = templateContent.replace(/<\/?template>/g, "").trim();

// 解析模板为AST
const ast = parse(templateOnly);

// 存储找到的中文文本
const chineseTexts = [];

// 递归遍历AST节点，查找中文文本
function traverseNode(node) {
  // 处理文本节点
  if (node.type === 2 || node.type === 3) {
    // Text或插值节点
    const text = node.content || (node.children && node.children[0] && node.children[0].content);
    if (text && /[\u4e00-\u9fa5]/.test(text)) {
      chineseTexts.push(text);
    }
  }

  // 处理属性中的中文
  if (node.props) {
    node.props.forEach((prop) => {
      // 处理普通属性值
      if (prop.value && typeof prop.value.content === "string" && /[\u4e00-\u9fa5]/.test(prop.value.content)) {
        chineseTexts.push(prop.value.content);
      }

      // 处理指令中的动态属性值
      if (prop.exp && prop.exp.content && /[\u4e00-\u9fa5]/.test(prop.exp.content)) {
        chineseTexts.push(prop.exp.content);
      }
    });
  }

  // 递归处理子节点
  if (node.children) {
    node.children.forEach((child) => {
      traverseNode(child);
    });
  }
}

// 开始遍历
traverseNode(ast);

console.log("找到的中文文本:");
console.log(chineseTexts);
