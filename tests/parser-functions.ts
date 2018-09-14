import { Page } from 'puppeteer';

export default {
  async beforeCodeChef(page: Page) {
    await page.waitFor('.breadcrumbs a');
  },

  async beforeCOJContest(page: Page) {
    await page.waitFor('#problem td > a');
  },

  async beforeCSAcademy(page: Page) {
    await page.waitFor('h1');
  },

  async beforeHackerRank(page: Page) {
    await page.waitFor('.problem-statement');
  },

  async beforeHITOnlineJudge(page: Page) {
    await page.waitFor('.ant-card-body pre');
  },

  async beforeNewGoogleCodeJam(page: Page) {
    await page.waitFor('.adventures > tr:last-child > td:nth-child(4) > a');
    await page.click('.adventures > tr:last-child > td:nth-child(4) > a');
    await page.waitFor('.collection > a:nth-child(2)');
    await page.click('.collection > a:nth-child(2)');
  },

  async beforeOldGoogleCodeJam(page: Page) {
    await page.waitFor('#dsb-problem-title0');
  },

  async beforeQDUOJ(page: Page) {
    await page.waitFor(() => /(\d+)MS/.test(document.body.innerHTML));
  },
};
