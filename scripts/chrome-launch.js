const chromeLaunch = require('chrome-launch');

chromeLaunch('http://codeforces.com/problemset/problem/954/G', {
  args: ['--load-extension=./build']
});
