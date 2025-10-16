const path = require("path");

module.exports = {
  mode: 'development',
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "calendarheatmap.js",
    library: 'CalendarHeatmap',
    libraryExport: 'default',
    libraryTarget: 'umd',
    globalObject: 'this',
    clean: false
  },
  devtool: "source-map",
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              ["@babel/preset-env", {
                targets: "> 0.25%, not dead",
                modules: false
              }]
            ],
            cacheDirectory: true
          }
        }
      }
    ]
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
  },
};