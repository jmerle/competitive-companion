import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import * as webExt from 'web-ext';

const projectRoot = path.dirname(__dirname);
const extensionDir = path.join(projectRoot, 'build-extension');
const tmpDir = path.join(projectRoot, 'firefox-tmp');

if (fs.existsSync(tmpDir)) {
  fs.rmSync(tmpDir, { recursive: true, force: true });
}

fs.mkdirSync(tmpDir);
process.env.TMPDIR = tmpDir;

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
