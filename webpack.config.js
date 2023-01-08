const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: './src/Main.ts',
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.png$/,
        type: 'asset/resource'
      },
      {
        test: /\.wav$/,
        type: 'asset/resource'
      },
      {
        test: /\.css$/,
        use: [ 'style-loader', 'css-loader' ]
      }
    ]
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
  },
  devServer: {
    host: '0.0.0.0',
    port: 8080
  },
  output: {
    filename: 'main.js',
    path: path.resolve(__dirname, 'build'),
  },
	plugins: [
		new HTMLWebpackPlugin()
	]
};
