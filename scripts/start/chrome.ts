import * as ChromeLauncher from 'chrome-launcher';
import { waitForBuild } from './utils';

await waitForBuild('chrome');

await ChromeLauncher.launch({
  startingUrl: 'https://codeforces.com/problemset/problem/954/G',
  ignoreDefaultFlags: true,
  chromeFlags: ['--no-first-run', '--no-default-browser-check', '--start-maximized', '--load-extension=./build-chrome'],
});
