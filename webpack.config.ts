import * as path from 'path';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import { Parser } from './src/parsers/Parser';

// There are no types for this package
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

function transformManifest(content: string): string {
  const manifest = JSON.parse(content);

  Object.keys(require.cache).forEach(id => {
    if (!id.includes('node_modules')) {
      delete require.cache[id];
    }
  });

  const parsers: Parser[] = require('./src/parsers/parsers').parsers;

  manifest.content_scripts[0].matches = parsers
    .map(p => p.getMatchPatterns())
    .reduce((a, b) => a.concat(...b), []);

  manifest.content_scripts[0].exclude_matches = parsers
    .map(p => p.getExcludedMatchPatterns())
    .reduce((a, b) => a.concat(...b), []);

  const packageData = require('./package.json');

  manifest.version = packageData.version;
  manifest.author = packageData.author;
  manifest.homepage_url = packageData.repository;

  return JSON.stringify(manifest, null, 2);
}

const config = {
  entry: {
    content: path.resolve(__dirname, 'src/content.ts'),
    background: path.resolve(__dirname, 'src/background.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/js'),
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'ts-loader',
        },
      },
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
        }
      },
    ],
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
        from: path.resolve(__dirname, 'src/vendor/browser-polyfill.js'),
        to: path.resolve(__dirname, 'build/js'),
      },
    ]),
    new UglifyJsPlugin(),
  ]
};

export default config;
