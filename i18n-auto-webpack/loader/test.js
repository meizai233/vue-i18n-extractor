const loaderUtils = require("loader-utils");
const schemaUtils = require("schema-utils");

const schema = {
  type: "object",
  properties: {
    test: {
      type: "string",
    },
  },
};

function exampleLoader(source) {
  const options = loaderUtils.getOptions(this);

  schemaUtils.validate(schema, options, {
    name: "Example Loader",
    baseDataPath: "options",
  });

  console.log("The request path", loaderUtils.urlToRequest(this.resourcePath));

  // 对资源应用一些转换……

  return `export default ${JSON.stringify(source)}`;
}

module.exports = exampleLoader;
