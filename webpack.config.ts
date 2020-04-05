// tslint:disable no-implicit-dependencies

import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as path from 'path';
import * as webpack from 'webpack';

function transformManifest(content: Buffer): string {
  const manifest = JSON.parse(content.toString());

  const packageData = require('./package.json');

  manifest.name = packageData.productName;
  manifest.description = packageData.description;
  manifest.version = packageData.version;
  manifest.author = packageData.author;
  manifest.homepage_url = packageData.repository;

  return JSON.stringify(manifest, null, 2);
}

function transformBrowserPolyfill(content: Buffer): string {
  return content.toString().replace('sourceMappingURL', 'disabledSourceMappingURL');
}

const config: webpack.Configuration = {
  entry: {
    background: path.resolve(__dirname, 'src/background.ts'),
    content: path.resolve(__dirname, 'src/content.ts'),
    options: path.resolve(__dirname, 'src/options.ts'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.worker\.js$/,
        loader: 'worker-loader',
        options: {
          fallback: false,
          inline: true,
        },
      },
      {
        test: /\.js$/,
        loader: 'string-replace-loader',
        options: {
          multiple: [
            {
              search: "new Function('');",
              replace: "throw new Error('');",
            },
            {
              search: "Function('return this')()",
              replace: 'self',
            },
            {
              search: 'new Function("return this")()',
              replace: "(() => { throw new Error(''); })()",
            },
            {
              search: 'Function(fn),',
              replace: '(() => {}),',
            },
            {
              search: 'Function("r", "regeneratorRuntime = r")(runtime)',
              replace: '',
            },
            {
              search: "new Function('c', 'size', js)",
              replace: '(() => {})',
            },
            {
              search: 'Function(fn))',
              replace: '(() => {}))',
            },
            {
              search: 'sourceMappingURL',
              replace: 'disabledSourceMappingURL',
            },
          ],
        },
      },
    ],
  },
  optimization: {
    minimize: false,
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/js'),
  },
  performance: {
    hints: false,
  },
  plugins: [
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, 'static/manifest.json'),
        to: path.resolve(__dirname, 'build'),
        transform: transformManifest,
      },
      {
        from: path.resolve(__dirname, 'icons'),
        to: path.resolve(__dirname, 'build/icons'),
      },
      {
        from: path.resolve(__dirname, 'node_modules/webextension-polyfill/dist/browser-polyfill.min.js'),
        to: path.resolve(__dirname, 'build/js'),
        transform: transformBrowserPolyfill,
      },
      {
        from: path.resolve(__dirname, 'src/options.html'),
        to: path.resolve(__dirname, 'build'),
      },
      {
        from: path.resolve(__dirname, 'LICENSE'),
        to: path.resolve(__dirname, 'build'),
      },
    ]),
  ],
  resolve: {
    extensions: ['.ts', '.js'],
  },
};

export default config;
