module.exports = {
  exitOnPageError: false,
  launchOptions: {
    headless: process.env.HEADLESS !== 'false',
    args: ['--start-maximized', '--disable-setuid-sandbox', '--no-sandbox'],
  },
};
