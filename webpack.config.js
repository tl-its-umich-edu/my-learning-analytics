import path from 'node:path'
import BundleTracker from 'webpack-bundle-tracker'

const projectDirectory = import.meta.dirname
const isDevelopment = process.env.BABEL_ENV !== 'production'

export default {
  mode: isDevelopment ? 'development' : 'production',
  entry: path.join(projectDirectory, 'assets/src/index'),
  output: {
    path: path.join(projectDirectory, 'assets/dist'),
    filename: isDevelopment ? '[name]-[fullhash].dev.js' : '[name]-[fullhash].js',
    clean: true
  },
  watchOptions: { poll: true },
  devtool: isDevelopment ? 'source-map' : false,
  module: {
    rules: [
      {
        test: /\.(js|mjs|jsx|ts|tsx)$/,
        include: path.join(projectDirectory, 'assets/src'),
        exclude: /node_modules/,
        type: 'javascript/auto',
        resolve: { fullySpecified: false },
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
      path: projectDirectory,
      filename: 'webpack-stats.json'
    })
  ]
}
