import * as fs from 'fs';
import * as path from 'path';
import * as esbuild from 'esbuild';

import '../../tests/build/init-environment';
import { parsers } from '../../src/parsers/parsers';

export function getBuildDirectory(target: string): string {
  const directory = path.resolve(__dirname, `../../build-${target}`);

  if (fs.existsSync(directory)) {
    fs.rmSync(directory, { recursive: true });
  }

  fs.mkdirSync(directory, { recursive: true });
  return directory;
}

export const commonOptions: esbuild.BuildOptions = {
  define: {
    PARSER_NAMES: JSON.stringify(parsers.map(parser => parser.constructor.name)),
  },
  plugins: [
    {
      name: 'remove-dangerous-code',
      setup: build => {
        build.onLoad({ filter: /pdfjs-dist/ }, async args => {
          let content = await fs.promises.readFile(args.path, 'utf-8');
          content = content.replace(/new Function\(/g, 'new Error(');
          content = content.replace(/eval\("require"\)\(this.workerSrc\)/g, 'null');

          return {
            contents: content,
            loader: args.path.endsWith('.worker.min.js') ? 'text' : 'js',
          };
        });
      },
    },
  ] as esbuild.Plugin[],
  logLevel: 'info',
};
