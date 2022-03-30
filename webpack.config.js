const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const isDevelopment = process.env.BABEL_ENV !== 'production'

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: path.join(__dirname, 'assets/src/index'),
  output: {
    path: path.join(__dirname, 'assets/dist'),
    filename: '[name]-[fullhash].js'
  },
  watchOptions: { poll: true },
  devtool: isDevelopment ? 'inline-source-map' : false,
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.(bmp|gif|jpeg|png|woff|woff2|eot|ttf|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: 'static/[name].[hash:8].[ext]'
        }
      }
    ]
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json'
    })
  ]
}
