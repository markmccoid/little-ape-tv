module.exports = function (api) {
  api.cache(true);
  // inline-import lets the Drizzle migrations (drizzle/*.sql) be bundled as strings
  const plugins = [['inline-import', { extensions: ['.sql'] }]];

  return {
    presets: [['babel-preset-expo', { jsxImportSource: 'nativewind' }], 'nativewind/babel'],

    plugins,
  };
};
