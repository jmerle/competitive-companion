import * as path from 'path';
import * as esbuild from 'esbuild';
import { projectRoot } from '../utils';
import { commonOptions, getBuildDirectory } from './utils';

esbuild
  .build({
    ...commonOptions,
    entryPoints: [path.resolve(projectRoot, 'tests/build/main.ts')],
    outdir: getBuildDirectory('test'),
    bundle: true,
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
