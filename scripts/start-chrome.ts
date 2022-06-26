import * as ChromeLauncher from 'chrome-launcher';

(async () => {
  await ChromeLauncher.launch({
    startingUrl: 'https://codeforces.com/problemset/problem/954/G',
    chromeFlags: ['--no-first-run', '--no-default-browser-check', '--start-maximized', '--load-extension=./build'],
    ignoreDefaultFlags: true,
  });
})();
