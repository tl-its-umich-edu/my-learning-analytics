const path = require('path')
const BundleTracker = require('webpack-bundle-tracker')
const CompressionPlugin = require('compression-webpack-plugin')

const isDevelopment = process.env.BABEL_ENV !== 'production'
module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: path.join(__dirname, 'assets/src/index'),
  output: {
    path: path.join(__dirname, 'assets/dist'),
    filename: '[name].[hash].js'
  },
  devtool: isDevelopment ? 'inline-source-map' : 'false',
  watchOptions: {
    ignored: /node_modules/,
    aggregateTimeout: 600
  },
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
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
  optimization: {
    splitChunks: {
      cacheGroups: {
        vendors: {
          name: 'vendors',
          test: /[\\/]node_modules[\\/]/,
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
    new BundleTracker({
      path: __dirname,
      filename: 'webpack-stats.json'
    }),
    new CompressionPlugin({
      filename: '[path].gz[query]',
      algorithm: 'gzip',
      test: /\.js$|\.css$|\.html$/,
      threshold: 10240,
      minRatio: 0.8
    })
  ]
}
