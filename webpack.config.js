const path = require("path");
const webpack = require("webpack");
const TerserPlugin = require("terser-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const HtmlInlineScriptPlugin = require("html-inline-script-webpack-plugin");

const BUILD_ENV = process.env.DBT_DOCS_ENV || "production";

module.exports = {
  resolve: {
    extensions: ['.js', '.html', '.css']
  },
  devtool:
    BUILD_ENV == "development" ? "eval-cheap-module-source-map" : "source-map",
  entry: "./src/app/index.run.js",
  output: {
    path: path.resolve(__dirname, "dist"),
    clean: true,
    publicPath: '',
  },
  devServer: {
    client: {
      overlay: false,
    },
    static: {
      directory: path.resolve(__dirname, "src"),
    },
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

    new HtmlInlineScriptPlugin(),
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
          { 
            loader: "html-loader",
            options: {
              minimize: false,
            }
          },
        ],
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /\.(ttf|eot|woff|woff2)$/,
        type: 'asset/inline',
      },
      {
        test: /\.svg$/,
        type: 'asset/inline',
        generator: {
          dataUrl: {
            encoding: 'base64',
            mimetype: 'image/svg+xml'
          }
        }
      },
      {
        test: /\.(png|ico|webmanifest)$/,
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 1000
          }
        },
        generator: {
          filename: '[name][ext]'
        }
      },
    ],
  },
};
