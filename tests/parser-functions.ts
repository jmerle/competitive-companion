import { Page } from 'puppeteer';

export default {
  async beforeAizuOnlineJudge(page: Page): Promise<void> {
    await page.waitForFunction('document.querySelector("#problemTitle").textContent.length > 0');
  },

  async beforeAizuOnlineJudgeBetaArena(page: Page): Promise<void> {
    await page.waitForSelector('#description_html pre');
  },

  async beforeAizuOnlineJudgeBetaNormal(page: Page): Promise<void> {
    await page.waitForSelector('.problemBody pre');
  },

  async beforeCodeChef(page: Page): Promise<void> {
    await page.waitForSelector('.breadcrumbs a');
  },

  async beforeCOJContest(page: Page): Promise<void> {
    await page.waitForSelector('#problem td > a');
  },

  async beforeECNU(page: Page): Promise<void> {
    await page.waitForSelector('.property > p > strong');
  },

  async beforeCSAcademy(page: Page): Promise<void> {
    await page.waitForSelector('h1');
  },

  async beforeFacebookCodingCompetitions(page: Page): Promise<void> {
    await page.waitForSelector('a[aria-label="Download"]');
  },

  async beforeHackerRank(page: Page): Promise<void> {
    await page.waitForSelector('.problem-statement');
  },

  async beforeHITOnlineJudge(page: Page): Promise<void> {
    await page.waitForSelector('.ant-card-body pre');
  },

  async beforeGoogleCodingCompetitions(page: Page): Promise<void> {
    await page.waitForSelector('.problem-io-wrapper pre.io-content');
  },

  async beforeLibraryChecker(page: Page): Promise<void> {
    await page.waitForSelector('.MuiContainer-root.MuiContainer-maxWidthLg > .MuiBox-root .MuiTypography-h2');
  },

  async beforeLibreOJProblem(page: Page): Promise<void> {
    await page.waitForSelector('.ui.header');
  },

  async beforeOldGoogleCodeJam(page: Page): Promise<void> {
    await page.waitForSelector('#dsb-problem-title0');
  },

  async beforeOmegaUp(page: Page): Promise<void> {
    await page.waitForSelector('td[data-memory-limit]');
  },

  async beforeQDUOJ(page: Page): Promise<void> {
    await page.waitForFunction(() => /(\d+)MS/.test(document.body.innerHTML));
  },

  async beforeTLXEnglish(page: Page): Promise<void> {
    // Wait for page to load & switch language
    await page.waitForSelector('.programming-problem-statement__name');
    await page.click('[data-key="statementLanguage"]');
    await page.click('[data-key="en"]');
    await page.click('.statement-language-form__button');
    await page.waitForSelector('.programming-problem-statement__name');
  },

  async beforeTLXIndonesian(page: Page): Promise<void> {
    // Wait for page to load & switch language
    await page.waitForSelector('.programming-problem-statement__name');
    await page.click('[data-key="statementLanguage"]');
    await page.click('[data-key="id"]');
    await page.click('.statement-language-form__button');
    await page.waitForSelector('.programming-problem-statement__name');
  },
};
