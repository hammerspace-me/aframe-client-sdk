require("@babel/polyfill");

module.exports = {
  entry: ["@babel/polyfill", "./index.js"],
  output: {
    path: __dirname,
    filename: "./dist/backpack-aframe-client-sdk.js",
  },
  mode: "development",
  module: {
    rules: [
      {
        test: /.js$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
    ],
  },
  devServer: {
    static: {
      directory: ".",
    },
    port: 9000,
  },
};
