const rootPath = process.cwd();
const { resolve } = require("path");

// 猜测 在这里存储的全局对象应该是作为一个storage存放的
let globalSetting = {};
// 本地的语言包
let exsitConfig = {};
let addConfig = {};
const resourceMap = {};
/**
 * 当前编译资源映射表
 * @type {Object.<string, Object.<string, {count: number, value: string}>}
 *
 * @description
 * 存储所有文件的国际化资源映射
 * - 外层键(key)是文件路径
 * - 外层值(value)是一个映射对象，其中:
 *   - 键(key)是国际化语言包对应的key
 *   - 值(value)是一个包含使用次数和实际文本的对象，格式为:
 *     - count: 该key被引用的次数
 *     - value: 对应的文本内容
 *
 * @example
 * // 示例结构
 * {
 *   "/src/components/Header.vue": {
 *     "welcome.message": {
 *       count: 1,
 *       value: "欢迎使用自动国际化插件"
 *     },
 *     "header.title": {
 *       count: 2,
 *       value: "应用标题"
 *     }
 *   },
 *   "/src/pages/Home.vue": {
 *     "home.greeting": {
 *       count: 3,
 *       value: "你好，世界！"
 *     }
 *   }
 * }
 */
let currentCompileResourceMap = {};
let compiledFiles = [];
let firstCompileDone = false;

/**
 * Initialize
 */
function init() {
  const defaultFile = {
    filename: "zh.json",
    path: resolve(rootPath, "./lang"),
  };
  const defaultSetting = {
    entry: { ...defaultFile },
    output: { ...defaultFile },
    localePattern: /[\u4e00-\u9fa5]/, // chinese
    keyRule: null,
    translate: {
      on: false,
      lang: ["en"],
      path: defaultFile.path,
      nameRule(lang) {
        return `${lang}.json`;
      },
      startTotal: 0,
      endTotal: 5000000,
      secretId: "", // If translate on, secretId is required
      secretKey: "", // If translate on, secretKey is required
      region: "ap-beijing",
      endpoint: "tmt.tencentcloudapi.com",
      source: "zh",
      projectId: 0,
    },
  };

  try {
    let setting = {};
    try {
      setting = require(rootPath + "/local.i18nauto.config.js");
    } catch (e) {
      setting = require(rootPath + "/i18nauto.config.js");
    }
    if (setting.entry && !setting.output) {
      Object.assign(defaultSetting.output, setting.entry);
    }
    for (const key in defaultSetting) {
      if (!setting[key]) {
        continue;
      }
      const value = defaultSetting[key];
      if (value && value.constructor === Object) {
        Object.assign(defaultSetting[key], setting[key]);
      } else {
        defaultSetting[key] = setting[key];
      }
    }
    // 如果设置开启翻译，且 没指定生成翻译文件的地址，则保持跟output的地址一致
    if (defaultSetting.translate.on && !setting.translate.path) {
      defaultSetting.translate.path = defaultSetting.output.path;
    }
  } catch (e) {
    console.warn('Lack of "i18nauto.config.js" file, use the default config...');
  }
  globalSetting = defaultSetting;

  const { path: entryPath, filename } = globalSetting.entry;
  const entryFile = resolve(entryPath, filename);
  globalSetting.entryFile = entryFile;

  // 拿到本地的语言包
  try {
    exsitConfig = require(entryFile);
  } catch (e) {
    console.error("There is no locale keyword file " + entryFile);
  }
}
init();

/**
 * Default rule to set the key for new word
 * @returns
 */
const defaultKeyRule = (value) => {
  const key = `i18n_${Buffer.from(value).toString("hex")}`;
  return key;
};

const updateConfig = (value) => {
  exsitConfig = value;
};

const setCurrentCompileResourceMap = (path, collection, keyInCodes) => {
  let config = {};
  if (keyInCodes.length) {
    keyInCodes.forEach((key) => {
      if (!exsitConfig[key]) {
        return;
      }
      if (!config[key]) {
        config[key] = {
          value: exsitConfig[key],
          count: 1,
        };
      } else {
        config[key].count++;
      }
    });
  } else if (collection.length === 0 && !firstCompileDone) {
    return;
  }

  collection.forEach((item) => {
    const key = Object.keys(item)[0];
    const val = item[key];
    if (!config[key]) {
      config[key] = {
        value: val,
        count: 1,
      };
    } else if (config[key].value === val) {
      config[key].count++;
    }
  });
  if (compiledFiles.includes(path)) {
    const temp = currentCompileResourceMap[path] || {};
    for (const key in temp) {
      if (config[key]) {
        config[key].count += temp[key].count;
      } else {
        config[key] = temp[key];
      }
    }
  }
  currentCompileResourceMap[path] = config;
};
const updateResourceMap = () => {
  let configNeedUpdate = false;
  let sourceMapNeedUpdate = false;

  for (const path in currentCompileResourceMap) {
    const newPathtMap = currentCompileResourceMap[path];
    const lastPathMap = resourceMap[path];

    if (!configNeedUpdate && firstCompileDone) {
      const newKeys = Object.keys(newPathtMap);
      const oldKeys = lastPathMap ? Object.keys(lastPathMap) : [];
      if (newKeys.length !== oldKeys.length || oldKeys.join("+") !== newKeys.join("+")) {
        configNeedUpdate = true;
        sourceMapNeedUpdate = true;
      } else {
        for (const key in newPathtMap) {
          if (newPathtMap[key].count !== lastPathMap[key].count) {
            sourceMapNeedUpdate = true;
            break;
          }
        }
      }
    }

    if (JSON.stringify(newPathtMap) === "{}") {
      if (lastPathMap) {
        delete resourceMap[path];
      }
    } else {
      resourceMap[path] = newPathtMap;
    }
  }
  currentCompileResourceMap = {};

  if (!firstCompileDone) {
    const newConfig = createConfigbyMap();
    let oldConfig = {};
    try {
      oldConfig = require(globalSetting.entryFile);
      if (Object.keys(newConfig).length !== Object.keys(oldConfig).length) {
        configNeedUpdate = true;
      } else {
        for (const key in newConfig) {
          if (newConfig[key].value !== oldConfig[key]) {
            configNeedUpdate = true;
            break;
          }
        }
      }
    } catch (e) {
      configNeedUpdate = true;
    }
    sourceMapNeedUpdate = true;
  }

  return {
    configNeedUpdate,
    sourceMapNeedUpdate,
  };
};

const getResource = (path) => {
  if (path) {
    const pathConfig = resourceMap[path];
    if (pathConfig) {
      return JSON.parse(JSON.stringify(pathConfig));
    } else {
      return {};
    }
  } else {
    return JSON.parse(JSON.stringify(resourceMap));
  }
};

const addCompiledFiles = (path) => {
  compiledFiles.includes(path) || compiledFiles.push(path);
};

const getCompiledFiles = (resourcePath) => {
  return resourcePath ? compiledFiles.includes(resourcePath) : compiledFiles.concat();
};

const setCompiledFiles = (val) => {
  compiledFiles = val;
};

const setCompileDone = (val) => {
  firstCompileDone = val;
};

const getCompileDone = () => {
  return firstCompileDone;
};

const createConfigbyMap = () => {
  let config = {};
  for (const path in resourceMap) {
    for (const key in resourceMap[path]) {
      const thisMap = resourceMap[path];
      if (!config[key]) {
        config[key] = JSON.parse(JSON.stringify(thisMap[key]));
      } else if (config[key].value === thisMap[key].value) {
        config[key].count += thisMap[key].count;
      }
    }
  }
  return config;
};

module.exports = {
  globalSetting,
  addConfig,
  exsitConfig,
  defaultKeyRule,
  setCurrentCompileResourceMap,
  updateResourceMap,
  getResource,
  addCompiledFiles,
  setCompiledFiles,
  setCompileDone,
  getCompileDone,
  createConfigbyMap,
  updateConfig,
};
