import * as path from 'path';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as CleanCSS from 'clean-css';
import Parser from "./src/parsers/Parser";

// There are no types for this package
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

function transformManifest(content: string): string {
  const manifest = JSON.parse(content);

  Object.keys(require.cache).forEach(id => {
    if (!id.includes('node_modules')) {
      delete require.cache[id];
    }
  });

  const parsers: Parser[] = require('./src/parsers/parsers').default;

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

function minifyCSS(content: string): string {
  return new CleanCSS().minify(content).styles;
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
        from: path.resolve(__dirname, 'src/globals.js'),
        to: path.resolve(__dirname, 'build/js'),
      },
      {
        from: path.resolve(__dirname, 'src/vendor/browser-polyfill.js'),
        to: path.resolve(__dirname, 'build/js'),
      },
      {
        from: path.resolve(__dirname, 'node_modules/nprogress/nprogress.css'),
        to: path.resolve(__dirname, 'build/css'),
        transform: minifyCSS,
      },
      {
        from: path.resolve(__dirname, 'node_modules/noty/lib/noty.css'),
        to: path.resolve(__dirname, 'build/css'),
        transform: minifyCSS,
      },
    ]),
    new UglifyJsPlugin(),
  ]
};

export default config;
