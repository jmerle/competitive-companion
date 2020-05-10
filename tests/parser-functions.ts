import { Page } from 'puppeteer';

export default {
  async beforeAizuOnlineJudgeNormal(page: Page): Promise<void> {
    await page.waitFor('.problemBody pre');
  },

  async beforeAizuOnlineJudgeArena(page: Page): Promise<void> {
    await page.waitFor('#description_html pre');
  },

  async beforeCodeChef(page: Page): Promise<void> {
    await page.waitFor('.breadcrumbs a');
  },

  async beforeCOJContest(page: Page): Promise<void> {
    await page.waitFor('#problem td > a');
  },

  async beforeECNU(page: Page): Promise<void> {
    await page.waitFor('.property > p > strong');
  },

  async beforeCSAcademy(page: Page): Promise<void> {
    await page.waitFor('h1');
  },

  async beforeHackerRank(page: Page): Promise<void> {
    await page.waitFor('.problem-statement');
  },

  async beforeHITOnlineJudge(page: Page): Promise<void> {
    await page.waitFor('.ant-card-body pre');
  },

  async beforeGoogleCodingCompetitions(page: Page): Promise<void> {
    await page.waitFor('.problem-io-wrapper pre.io-content');
  },

  async beforeOldGoogleCodeJam(page: Page): Promise<void> {
    await page.waitFor('#dsb-problem-title0');
  },

  async beforeQDUOJ(page: Page): Promise<void> {
    await page.waitFor(() => /(\d+)MS/.test(document.body.innerHTML));
  },
};
