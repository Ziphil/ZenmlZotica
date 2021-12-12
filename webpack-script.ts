//

import path from "path";


let config = {
  entry: {
    index: ["./source/script/main.ts"]
  },
  output: {
    path: path.join(__dirname, "dist"),
    filename: "script.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: "ts-loader",
          options: {
            configFile: "tsconfig-script.json",
          }
        }
      }
    ]
  },
  resolve: {
    extensions: [".ts"]
  },
  cache: true
};

export default config;