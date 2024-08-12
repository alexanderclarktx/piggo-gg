const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");
const webpack = require('webpack');

module.exports = {
  entry: './src/window.ts',
  target: 'electron-main',
  mode: "production",
  stats: "minimal",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      }
    ],
  },
  optimization: {
    minimize: process.env.ENV === "production",
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: { comments: false },
        },
      }),
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/*.html", to: () => "[name].html" },
        // { from: "./src/*.css", to: () => "[name].css" },
        // { from: "./res/favicon.ico", to: () => "favicon.ico" },
        // { from: "./res/*.svg", to: () => "[name].svg" },
        // { from: "./res/*.png", to: () => "[name].png" },
        // { from: "./res/*.json", to: () => "[name].json" }
      ],
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
  resolve: {
    extensions: [".ts", ".js"],
  },
  output: {
    filename: "piggo-gg-min-electron.js",
    path: path.resolve(__dirname, "dist/electron"),
  }
}
