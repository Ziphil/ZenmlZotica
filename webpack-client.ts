//

import path from "path";


let config = {
  entry: {
    index: ["./source/client/script/index.ts"]
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
            configFile: "tsconfig-client.json",
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