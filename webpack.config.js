const path = require("path");
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlWebpackInlineSourcePlugin = require("html-webpack-inline-source-plugin");

const BUILD_ENV = process.env.DBT_DOCS_ENV || "production";

module.exports = {
  devtool:
    BUILD_ENV == "development" ? "eval-cheap-module-source-map" : "source-map",
  entry: "./src/app/index.run.js",
  output: {
    path: path.resolve(__dirname, "dist"),
  },
  devServer: {
    contentBase: "./src",
  },
  plugins: [
    new webpack.DefinePlugin({
      "process.env": {
        NODE_ENV: JSON.stringify(BUILD_ENV),
      },
    }),

    new HtmlWebpackPlugin({
      template: "./src/index.html",
      inlineSource: ".(js|css)$",
    }),

    new HtmlWebpackInlineSourcePlugin(),
  ],
  mode: BUILD_ENV,
  module: {
    rules: [
      {
        test: /.*src\/app\/.*\.html$/,
        use: [
          {
            loader:
              "ngtemplate-loader?relativeTo=" +
              path.resolve(__dirname, "./src/app"),
          },
          { loader: "html-loader" },
        ],
      },
      {
        test: /\.css$/,
        use: [{ loader: "style-loader" }, { loader: "css-loader" }],
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        use: "base64-inline-loader",
      },
      {
        test: /\.svg$/,
        loader: "svg-url-loader",
        options: {
          // Images larger than 10 KB won’t be inlined
          limit: 10 * 1024,
          noquotes: true,
        },
      },
      {
        test: /\.(png|ico|webmanifest)$/,
        use: "base64-inline-loader?limit=1000&name=[name].[ext]",
      },
    ],
  },
};
