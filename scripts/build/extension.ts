import fs from 'node:fs';
import path from 'node:path';
import esbuild from 'esbuild';
import { projectRoot } from '../utils';
import { commonOptions, getBuildDirectory } from './utils';

const isProduction = process.argv[2] === 'true';
const watch = process.argv[3] === 'true';

const buildDirectory = getBuildDirectory('extension');

function parseJSON(file: string): any {
  return JSON.parse(fs.readFileSync(file, { encoding: 'utf-8' }));
}

for (const { from, to } of [
  {
    from: () => {
      const manifest = parseJSON(path.resolve(projectRoot, 'static/manifest.json'));
      const packageData = parseJSON(path.resolve(projectRoot, 'package.json'));

      manifest.name = packageData.productName;
      manifest.description = packageData.description;
      manifest.version = packageData.version;
      manifest.author = packageData.author;
      manifest.homepage_url = packageData.repository;

      return JSON.stringify(manifest, null, 2);
    },
    to: path.resolve(buildDirectory, 'manifest.json'),
  },
  {
    from: path.resolve(projectRoot, 'media/icons'),
    to: path.resolve(buildDirectory, 'icons'),
  },
  {
    from: path.resolve(projectRoot, 'src/options.html'),
    to: path.resolve(buildDirectory, 'options.html'),
  },
  {
    from: path.resolve(projectRoot, 'LICENSE'),
    to: path.resolve(buildDirectory, 'LICENSE'),
  },
]) {
  if (typeof from === 'function') {
    fs.writeFileSync(to, from());
  } else {
    fs.cpSync(from, to, { recursive: true });
  }

  console.log(`Created ${path.relative(projectRoot, to)}`);
}

const options: esbuild.BuildOptions = {
  ...commonOptions,
  entryPoints: [
    path.resolve(projectRoot, 'src/background.ts'),
    path.resolve(projectRoot, 'src/content.ts'),
    path.resolve(projectRoot, 'src/options.ts'),
  ],
  outdir: path.resolve(buildDirectory, 'js'),
  bundle: true,
  format: 'esm',
  minifyWhitespace: isProduction,
  minifySyntax: isProduction,
};

if (watch) {
  esbuild
    .context(options)
    .then(ctx => ctx.watch())
    .catch(err => {
      console.error(err);
      process.exit(1);
    });
} else {
  esbuild.build(options).catch(err => {
    console.error(err);
    process.exit(1);
  });
}
