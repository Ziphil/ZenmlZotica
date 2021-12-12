//

import path from "path";
import externals from "webpack-node-externals";


let config = {
  entry: {
    index: ["./source/index.ts"]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "[name].js",
    library: {
      type: "commonjs"
    }
  },
  devtool: "inline-source-map",
  mode: "development",
  target: "node",
  externals: [externals()],
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig-main.json",
          }
        }
      },
      {
        test: /\.js$/,
        enforce: "pre",
        use: {
          loader: "source-map-loader"
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts", ".js"]
  },
  cache: true
};

export default config;