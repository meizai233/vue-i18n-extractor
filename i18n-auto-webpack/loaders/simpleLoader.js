/**
 * 简单的 webpack loader 示例
 * 用于在 JavaScript 文件中添加元信息和简单处理
 */

// 把所有的js文件都加行了 “由 simple-loader 处理” 一系列注释
const loaderUtils = require("loader-utils");

/**
 * @param {string} source - 输入文件的源代码内容
 * @returns {string} - 处理后的内容
 */
function simpleLoader(source) {
  // 标记 loader 为可缓存的，提高构建性能
  this.cacheable && this.cacheable();

  // 获取当前处理的文件路径
  const filePath = this.resourcePath;
  const fileName = filePath.split("/").pop();

  // 获取 loader 选项
  const options = this.getOptions() || {};
  const addTimestamp = options.addTimestamp || true;
  const addComments = options.addComments || true;

  // 添加构建时间戳和文件信息注释
  let result = source;

  if (addComments) {
    const comment = `
  /**
   * 文件名: ${fileName}
   * 处理时间: ${new Date().toISOString()}
   * 由 simple-loader 处理
   */
  `;
    result = comment + result;
  }

  // 如果是开发环境，添加控制台日志便于调试
  if (process.env.NODE_ENV === "development") {
    console.log(`[simple-loader] 处理文件: ${fileName}`);
  }

  // 简单替换示例 - 自动在 console.log 中添加文件名前缀
  // 这里使用正则表达式替换所有 console.log 调用
  // 注意：这是一个简化的示例，不处理复杂情况
  result = result.replace(/console\.log\s*\(/g, `console.log('[${fileName}] ', `);

  return result;
  // return `export default ${JSON.stringify(source)}`;
}

module.exports = simpleLoader;
