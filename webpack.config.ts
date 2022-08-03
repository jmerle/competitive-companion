import * as path from 'path';
import * as process from 'process';
import CopyPlugin = require('copy-webpack-plugin');
import ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
import * as TerserPlugin from 'terser-webpack-plugin';
import * as webpack from 'webpack';
import { merge } from 'webpack-merge';

function transformManifest(content: Buffer): string {
  const manifest = JSON.parse(content.toString());

  const packageData = require('./package.json');

  manifest.name = packageData.productName;
  manifest.description = packageData.description;
  manifest.version = packageData.version;
  manifest.author = packageData.author;

  // eslint-disable-next-line @typescript-eslint/naming-convention
  manifest.homepage_url = packageData.repository;

  return JSON.stringify(manifest, null, 2);
}

const commonConfig: webpack.Configuration = {
  resolve: {
    extensions: ['.ts', '.js'],
  },
  devtool: false,
  optimization: {
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          // eslint-disable-next-line @typescript-eslint/naming-convention
          keep_classnames: true,
        },
      }) as any,
    ],
  },
  performance: {
    hints: false,
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.worker\.min\.js$/,
        loader: 'worker-loader',
        options: {
          inline: 'no-fallback',
        },
      },
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: /new Function\(/g,
              replace: 'new Error(',
            },
            {
              search: 'eval("require")(this.workerSrc)',
              replace: 'null',
            },
            {
              search: /this\.editorDiv\.innerHTML/g,
              replace: '_',
            },
          ],
        },
      },
    ],
  },
  plugins: [new ForkTsCheckerWebpackPlugin()],
};

const extensionConfig: webpack.Configuration = {
  entry: {
    background: path.resolve(__dirname, 'src/background.ts'),
    content: path.resolve(__dirname, 'src/content.ts'),
    options: path.resolve(__dirname, 'src/options.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build-extension/js'),
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      name: 'common',
    },
  },
  plugins: [
    new CopyPlugin({
      patterns: [
        {
          from: path.resolve(__dirname, 'static/manifest.json'),
          to: path.resolve(__dirname, 'build-extension'),
          transform: transformManifest,
        },
        {
          from: path.resolve(__dirname, 'media/icons'),
          to: path.resolve(__dirname, 'build-extension/icons'),
        },
        {
          from: path.resolve(__dirname, 'src/options.html'),
          to: path.resolve(__dirname, 'build-extension'),
        },
        {
          from: path.resolve(__dirname, 'LICENSE'),
          to: path.resolve(__dirname, 'build-extension'),
        },
      ],
    }) as any,
  ],
};

const testConfig: webpack.Configuration = {
  entry: {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    'expose-parsers': path.resolve(__dirname, 'tests/expose-parsers.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build-test'),
  },
};

export default merge(commonConfig, process.env.WEBPACK_PROFILE === 'extension' ? extensionConfig : testConfig);
