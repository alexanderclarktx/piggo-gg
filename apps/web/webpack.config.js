const path = require("path");
const CopyWebpackPlugin = require("copy-webpack-plugin");
const TerserPlugin = require("terser-webpack-plugin");

module.exports = {
  entry: ["./src/index.tsx"],
  mode: "development",
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
    minimize: process.env.NODE_ENV === "production",
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          format: {
            comments: false,
          },
        },
      }),
    ],
  },
  devtool: "cheap-module-source-map",
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
        {
          from: "./src/*.html",
          to: () => "[name].html"
        },
        {
          from: "./src/*.css",
          to: () => "[name].css"
        },
        {
          from: "./src/favicon.ico",
          to: () => "favicon.ico"
        },
        {
          from: "./res/*.png",
          to: () => "[name].png"
        },
        {
          from: "./res/*.json",
          to: () => "[name].json"
        }
      ],
    })
  ],
  resolve: {
    extensions: [".tsx", ".ts", ".js"],
  },
  output: {
    filename: "piggo-legends-min.js",
    path: path.resolve(__dirname, "dist"),
  }
};
