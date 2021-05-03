import * as path from 'path';
import * as CopyWebpackPlugin from 'copy-webpack-plugin';
import * as TerserPlugin from 'terser-webpack-plugin';
import * as webpack from 'webpack';

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

const config: webpack.Configuration = {
  entry: {
    background: path.resolve(__dirname, 'src/background.ts'),
    content: path.resolve(__dirname, 'src/content.ts'),
    options: path.resolve(__dirname, 'src/options.ts'),
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'build/js'),
  },
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
    splitChunks: {
      chunks: 'all',
      name: 'common',
    },
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
              search: 'new Function("");',
              replace: "throw new Error('');",
            },
            {
              search: 'new Function("c","size",n)',
              replace: 'null',
            },
            {
              search: 'eval("require")(getWorkerSrc())',
              replace: 'null',
            },
          ],
        },
      },
    ],
  },
  plugins: [
    new CopyWebpackPlugin({
      patterns: [
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
          from: path.resolve(__dirname, 'src/options.html'),
          to: path.resolve(__dirname, 'build'),
        },
        {
          from: path.resolve(__dirname, 'LICENSE'),
          to: path.resolve(__dirname, 'build'),
        },
      ],
    }) as any,
  ],
};

export default config;
