module.exports = {
  exitOnPageError: false,
  launch: {
    ignoreHTTPSErrors: true,
    headless: process.env.HEADLESS !== 'false',
    args: ['--start-maximized', '--no-sandbox'],
  },
};
