const fs = require("fs");
const path = require("path");

/**
 * 在zh.json中增量添加配置对象
 * @param {Object} addConfig 要添加的配置对象
 * @param {string} filePath zh.json的文件路径，默认为'./lang/zh.json'
 */
function createFile(addConfig, filePath = "./lang/zh.json") {
  try {
    // 确保目录存在
    const directory = path.dirname(filePath);
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    let existingConfig = {};

    // 检查文件是否存在
    if (fs.existsSync(filePath)) {
      try {
        // 读取现有的JSON文件
        const fileContent = fs.readFileSync(filePath, "utf8");
        existingConfig = JSON.parse(fileContent);
      } catch (parseError) {
        console.error("解析现有文件失败，将创建新文件", parseError);
      }
    }

    // 增量添加新配置，只添加不存在的键
    let hasChanges = false;
    for (const key in addConfig) {
      if (!(key in existingConfig)) {
        existingConfig[key] = addConfig[key];
        hasChanges = true;
      }
    }

    // 只有在有变更时才写入文件
    if (hasChanges || Object.keys(existingConfig).length === 0) {
      fs.writeFileSync(filePath, JSON.stringify(existingConfig, null, 2), "utf8");
      console.log(`成功更新文件: ${filePath}`);
    } else {
      console.log(`没有新的配置需要添加到: ${filePath}`);
    }

    return true;
  } catch (error) {
    console.error("创建或更新文件失败:", error);
    return false;
  }
}

module.exports = { createFile };
