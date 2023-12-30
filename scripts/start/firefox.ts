import * as fs from 'node:fs';
import * as path from 'node:path';
// @ts-expect-error There are no types for this import
import * as webExt from 'web-ext';
import { projectRoot } from '../utils';
import { waitForBuild } from './utils';

await waitForBuild();

const extensionDir = path.join(projectRoot, 'build-extension');
const tmpDir = path.join(projectRoot, 'firefox-tmp');

if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

fs.mkdirSync(tmpDir);
process.env.TMPDIR = tmpDir;

await webExt.cmd.run(
  {
    sourceDir: extensionDir,
    startUrl: 'https://codeforces.com/problemset/problem/954/G',
    pref: {
      'devtools.browserconsole.filter.jswarn': 'false',
      'devtools.webconsole.filter.warn': 'false',
    },
  },
  {
    shouldExitProgram: false,
  },
);
