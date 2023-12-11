import * as fs from 'fs';
import * as path from 'path';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as webExt from 'web-ext';
import { projectRoot } from '../utils';
import { waitForBuild } from './utils';

const extensionDir = path.join(projectRoot, 'build-extension');
const tmpDir = path.join(projectRoot, 'firefox-tmp');

if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

fs.mkdirSync(tmpDir);
process.env.TMPDIR = tmpDir;

waitForBuild().then(() => {
  webExt.cmd
    .run(
      {
        sourceDir: extensionDir,
        startUrl: 'https://codeforces.com/problemset/problem/954/G',
        pref: {
          'devtools.browserconsole.filter.jswarn': 'false',
          'devtools.webconsole.filter.warn': 'false',
        },
      },
      { shouldExitProgram: false },
    )
    .catch((err: any) => {
      console.error(err);
      process.exit(1);
    });
});
