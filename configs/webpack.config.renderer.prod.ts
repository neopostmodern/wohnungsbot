/**
 * Build config for electron renderer process
 */

import path from 'path';
import webpack, { Configuration } from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CssMinimizerPlugin from 'css-minimizer-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import { merge } from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import { styleRules, imageAndFontRules } from './commonRules';

CheckNodeEnv('production');
export default merge<Configuration>(baseConfig, {
  devtool: 'source-map',

  mode: 'production',

  target: 'electron-renderer',

  entry: path.join(__dirname, '..', 'app/index.tsx'),

  output: {
    path: path.join(__dirname, '..', 'app/dist'),
    publicPath: './',
    filename: 'renderer.prod.js'
  },

  module: {
    rules: [...styleRules, ...imageAndFontRules]
  },

  optimization: {
    minimizer: process.env.E2E_BUILD
      ? []
      : [
          new TerserPlugin({
            parallel: true
          }),
          new CssMinimizerPlugin()
        ]
  },

  plugins: [
    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    }),

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    })
  ]
});
