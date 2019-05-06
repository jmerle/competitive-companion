module.exports = {
  exitOnPageError: false,
  launch: {
    headless: process.env.HEADLESS !== 'false',
    args: ['--start-maximized', '--disable-setuid-sandbox', '--no-sandbox'],
  },
};
