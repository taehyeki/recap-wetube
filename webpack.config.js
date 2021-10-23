const path = require("path");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const BASE_JS = "./src/client/js/";
module.exports = {
  entry: {
    main: BASE_JS + "main.js",
    videoPlayer: BASE_JS + "videoPlayer.js",
    record: BASE_JS + "record.js",
    commentSection: BASE_JS + "commentSection.js",
  },
  plugins: [new MiniCssExtractPlugin({ filename: "css/style.css" })],
  output: {
    clean: true,
    filename: "js/[name].js",
    path: path.resolve(__dirname, "assets"),
  },
  module: {
    rules: [
      {
        test: /\.m?js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
          options: {
            presets: ["@babel/preset-env"],
          },
        },
      },
      {
        test: /\.s[ac]ss$/i,
        use: [MiniCssExtractPlugin.loader, "css-loader", "sass-loader"],
      },
    ],
  },
};
