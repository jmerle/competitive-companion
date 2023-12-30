import * as path from 'node:path';
import * as esbuild from 'esbuild';
import { projectRoot } from '../utils';
import { commonOptions, getBuildDirectory } from './utils';

await esbuild.build({
  ...commonOptions,
  entryPoints: [path.resolve(projectRoot, 'tests/build/main.ts')],
  outdir: await getBuildDirectory('test'),
  bundle: true,
  format: 'esm',
});
