/* eslint global-require: off, import/no-dynamic-require: off, no-console: off */

/**
 * Build config for development electron renderer process that uses
 * Hot-Module-Replacement
 *
 * https://webpack.js.org/concepts/hot-module-replacement/
 */

import path from 'path';
import fs from 'fs';
import webpack, { Configuration } from 'webpack';
import { Configuration as DevServerConfiguration } from 'webpack-dev-server';
import { merge } from 'webpack-merge';
import { spawn, execSync } from 'child_process';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import baseConfig from './webpack.config.base';
import CheckNodeEnv from '../internals/scripts/CheckNodeEnv';
import { styleRules, imageAndFontRules } from './commonRules';

CheckNodeEnv('development');

const port = process.env.PORT || 1212;
const publicPath = `http://localhost:${port}/dist`;
const dll = path.join(__dirname, '..', 'dll');
const manifest = path.resolve(dll, 'renderer.json');
const requiredByDLLConfig = module.parent.filename.includes(
  'webpack.config.renderer.dev.dll'
);

/**
 * Warn if the DLL is not built
 */
if (!requiredByDLLConfig && !(fs.existsSync(dll) && fs.existsSync(manifest))) {
  console.log(
    'The DLL files are missing. Sit back while we build them for you with "yarn build-dll"'
  );
  execSync('yarn build-dll');
}

export default merge<Configuration | DevServerConfiguration>(baseConfig, {
  devtool: 'inline-source-map',

  mode: 'development',

  target: 'electron-renderer',

  entry: [
    `webpack-dev-server/client?http://localhost:${port}/`,
    'webpack/hot/only-dev-server',
    require.resolve('../app/index.tsx')
  ],

  output: {
    publicPath: `http://localhost:${port}/dist/`,
    filename: 'renderer.dev.js'
  },

  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            cacheDirectory: true
          }
        }
      },
      ...styleRules,
      ...imageAndFontRules
    ]
  },

  plugins: [
    requiredByDLLConfig
      ? null
      : new webpack.DllReferencePlugin({
          context: path.join(__dirname, '..', 'dll'),
          manifest: require(manifest),
          sourceType: 'var'
        }),

    new webpack.HotModuleReplacementPlugin({
      multiStep: true
    }),

    new webpack.NoEmitOnErrorsPlugin(),

    /**
     * Create global constants which can be configured at compile time.
     *
     * Useful for allowing different behaviour between development builds and
     * release builds
     *
     * NODE_ENV should be production so that modules do not perform certain
     * development checks
     *
     * By default, use 'development' as NODE_ENV. This can be overriden with
     * 'staging', for example, by changing the ENV variables in the npm scripts
     */
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development'
    }),

    new webpack.LoaderOptionsPlugin({
      debug: true
    }),

    new webpack.optimize.LimitChunkCountPlugin({
      maxChunks: 1
    }),

    new MiniCssExtractPlugin()
  ],

  node: {
    __dirname: false,
    __filename: false
  },

  devServer: {
    port,
    compress: true,
    devMiddleware: {
      publicPath,
      stats: 'errors-only'
    },
    hot: true,
    headers: { 'Access-Control-Allow-Origin': '*' },
    static: {
      directory: path.join(__dirname, '../app/dist'),
      watch: {
        aggregateTimeout: 300,
        ignored: /node_modules/,
        poll: 100
      }
    },
    historyApiFallback: {
      verbose: true
    },
    onBeforeSetupMiddleware() {
      if (process.env.START_HOT) {
        console.log('Starting Main Process...');
        spawn('npm', ['run', 'start-main-dev'], {
          shell: true,
          env: process.env,
          stdio: 'inherit'
        })
          .on('close', (code) => process.exit(code))
          .on('error', (spawnError) => console.error(spawnError));
      }
    }
  }
});
