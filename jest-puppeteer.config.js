module.exports = {
  exitOnPageError: false,
  launch: {
    headless: process.env.HEADLESS !== 'false',
    args: ['--start-maximized', '--no-sandbox'],
  },
};
