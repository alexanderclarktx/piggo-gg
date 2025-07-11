const path = require("path")
const CopyWebpackPlugin = require("copy-webpack-plugin")
const TerserPlugin = require("terser-webpack-plugin")
const webpack = require('webpack')

module.exports = {
  entry: ["./src/index.tsx"],
  mode: "development",
  stats: "minimal",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/
      }
    ]
  },
  optimization: {
    minimize: process.env.ENV === "production",
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: { comments: false }
        }
      })
    ]
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        { from: "./src/*.html", to: () => "[name].html" },
        { from: "./src/*.css", to: () => "[name].css" },
        { from: "./res/*.svg", to: () => "[name].svg" },
        { from: "./res/*.png", to: () => "[name].png" },
        { from: "./res/*.jpg", to: () => "[name].jpg" },
        { from: "./res/*.json", to: () => "[name].json" },
        { from: "./res/*.mp3", to: () => "[name].mp3" },
        { from: "./res/*.wav", to: () => "[name].wav" },
        { from: "./res/*.txt", to: () => "[name].txt" },
        { from: "./res/*.glb", to: () => "[name].glb" }
      ]
    }),
    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },
  output: {
    filename: "piggo-gg-min.js",
    path: path.resolve(__dirname, "dist")
  }
}
