const { globalSetting, getResource, setCompileDone, setCompiledFiles, updateResourceMap, createConfigbyMap, updateConfig, addConfig } = require("../common/collect");
const { createFile } = require("../common/utils");

let once = false;
let translating = false;

/**
 * Create locale language config
 * @param {Object} output
 */
const createConfig = (output) => {
  const localeWordConfig = createConfigbyMap();
  const { path, filename } = output || globalSetting.output;
  let content = {};
  for (const key in localeWordConfig) {
    if (Object.prototype.hasOwnProperty.call(localeWordConfig, key)) {
      content[key] = localeWordConfig[key].value || "";
    }
  }
  updateConfig(content);
  content = JSON.stringify(content);
  createFile({ content, path, filename });
};

const createEmit = ({ output, sourceMap, translate }, fileChange) => {
  const { configNeedUpdate, sourceMapNeedUpdate } = fileChange;

  // if (configNeedUpdate) {
  // createConfig(output);
  // createConfig
  // }
};
class I18nConfigPlugin {
  constructor(options) {
    this.options = options;
  }
  apply(compiler) {
    const { output, sourceMap, translate } = this.initOption() || {};

    // 在compiler的done hook上注册一个事件，名字为 自动国际化，callback为
    compiler.hooks.done.tap("i18nAutoPlugin", (stats) => {
      // 拿到国际化map的配置 怎么拿?

      const handleData = () => {
        const fileChange = updateResourceMap();
        setCompiledFiles([]);
        setCompileDone(true);
        // createEmit(
        //   {
        //     output,
        //     sourceMap,
        //     translate,
        //   },
        //   fileChange
        // );

        createFile(addConfig);
      };
      // 待办 这里可以优化 具体优化啥还不知道 可能是热更新之类的
      handleData();
    });
  }

  initOption() {
    // 待办 确认下这个配置是啥意思
    const { output, watch, sourceMap, translate } = this.options || {};
  }
}

module.exports = I18nConfigPlugin;
