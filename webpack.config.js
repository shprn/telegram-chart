const ExtractTextPlugin = require('extract-text-webpack-plugin')

module.exports = {
  entry: './app/main.js',
  output: {
    filename: './assets/js/telegram_chart.min.js',
    library: 'chart'
  },
    mode: 'development',
    optimization: {
        minimize: true
  },
  module: {
    rules: [
      {
        test: /\.html$/,
        exclude: /node_modules/,
        use: {loader: 'raw-loader'}
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: 'css-loader'
        })
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }      
    ]
  },
  plugins: [
    new ExtractTextPlugin('./assets/css/telegram_chart.css')
  ]
};