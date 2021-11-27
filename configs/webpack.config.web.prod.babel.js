/**
 * Build config for an independent web distribution
 */

import path from 'path';
import webpack from 'webpack';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import merge from 'webpack-merge';
import TerserPlugin from 'terser-webpack-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import { styleRules, imageAndFontRules } from './commonRules';

CheckNodeEnv('production');
const mergedConfig = merge.smart(baseConfig, {
  devtool: 'source-map',

  mode: 'production',

  target: 'web',

  entry: path.join(__dirname, '..', 'app/index'),

  output: {
    path: path.join(__dirname, '..', 'app/web'),
    publicPath: './',
    filename: 'web.prod.js',
    chunkFilename: '[name].bundle.js',
    libraryTarget: 'var'
  },

  module: {
    rules: [...styleRules, ...imageAndFontRules]
  },

  optimization: {
    minimizer: [
      new TerserPlugin({
        parallel: true
      }),
      new OptimizeCSSAssetsPlugin({
        cssProcessorOptions: {
          map: {
            inline: false,
            annotation: true
          }
        }
      })
    ],
    splitChunks: {
      chunks: 'async',
      name: true
    }
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

    new webpack.DefinePlugin({
      __TARGET__: '"web"'
    }),

    // block everything with 'electron' in it (except in folder `actions` or
    // `reducers`, which is just redux infrastructure) or 'persist'(ance)
    new webpack.IgnorePlugin({
      checkResource(resource: string) {
        if (/electron/.test(resource)) {
          return !/actions/.test(resource) && !/Utils/.test(resource);
        }

        if (/persist/.test(resource)) {
          return true;
        }

        if (/middleware\/helpers/.test(resource)) {
          return true;
        }

        return false;
      },
      checkContext(context: string) {
        return !/reducers/.test(context);
      }
    }),

    new webpack.EnvironmentPlugin({
      NODE_ENV: 'production'
    }),

    new MiniCssExtractPlugin({
      filename: 'style.css'
    }),

    new BundleAnalyzerPlugin({
      analyzerMode:
        process.env.OPEN_ANALYZER === 'true' ? 'server' : 'disabled',
      openAnalyzer: process.env.OPEN_ANALYZER === 'true'
    })
  ]
});

// override
mergedConfig.externals = {};

export default mergedConfig;
