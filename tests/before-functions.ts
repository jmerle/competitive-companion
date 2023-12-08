import { Page } from 'puppeteer';

export const beforeFunctions: { [name: string]: (page: Page) => Promise<void> } = {
  async beforeAizuOnlineJudge(page: Page): Promise<void> {
    await page.waitForFunction('document.querySelector("#problemTitle").textContent.length > 0');
  },

  async beforeAizuOnlineJudgeBetaArena(page: Page): Promise<void> {
    await page.waitForSelector('#description_html pre');
  },

  async beforeAizuOnlineJudgeBetaNormal(page: Page): Promise<void> {
    await page.waitForSelector('.problemBody pre');
  },

  async beforeCodeChefNew(page: Page): Promise<void> {
    await page.waitForSelector('#problem-statement > p');
  },

  async beforeCodeChefOld(page: Page): Promise<void> {
    await page.waitForSelector('.breadcrumbs a');
  },

  async beforeCodeDrills(page: Page): Promise<void> {
    await page.waitForSelector('main .container .v-sheet > .row:last-child');
  },

  async beforeCOJContest(page: Page): Promise<void> {
    await page.waitForSelector('#problem td > a');
  },

  async beforeCSAcademy(page: Page): Promise<void> {
    await page.waitForSelector('h1');
  },

  async beforeCPythonUZ(page: Page): Promise<void> {
    await page.waitForSelector('h2.text-center, h2.content-header-title');
  },

  async beforeECNU(page: Page): Promise<void> {
    await page.waitForSelector('.property > p > strong');
  },

  async beforeHackerEarth(page: Page): Promise<void> {
    await page.waitForSelector('.input-output');
  },

  async beforeHackerRank(page: Page): Promise<void> {
    await page.waitForSelector('.problem-statement');
  },

  async beforeHITOnlineJudge(page: Page): Promise<void> {
    await page.waitForSelector('.ant-card-body pre');
  },

  async beforeGoogleCodingCompetitions(page: Page): Promise<void> {
    await page.waitForSelector('.problem-io-wrapper pre.io-content, .problem-io-wrapper-new pre.sample-content-text');
  },

  async beforeLibraryChecker(page: Page): Promise<void> {
    await page.waitForSelector('.MuiContainer-root.MuiContainer-maxWidthLg .MuiTypography-h2');
  },

  async beforeLibreOJProblem(page: Page): Promise<void> {
    await page.waitForSelector('.ui.header');
  },

  async beforeMetaCodingCompetitions(page: Page): Promise<void> {
    await page.waitForSelector('a[aria-label="Download"]');
  },

  async beforeNOJ(page: Page): Promise<void> {
    await page.waitForSelector('material-preloader.loaded');
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

  async beforeSDUTOnlineJudge(page: Page): Promise<void> {
    await page.waitForSelector('.problem-content > h2');
  },

  async beforeTLXEnglish(page: Page): Promise<void> {
    // Wait for page to load & switch language
    await page.waitForSelector('.programming-problem-statement__name');
    await page.click('[data-key="language"]');
    await page.click('[data-key="en"]');
    await page.click('.language-form__button');
    await page.waitForSelector('.programming-problem-statement__name');
  },

  async beforeTLXIndonesian(page: Page): Promise<void> {
    // Wait for page to load & switch language
    await page.waitForSelector('.programming-problem-statement__name');
    await page.click('[data-key="language"]');
    await page.click('[data-key="id"]');
    await page.click('.language-form__button');
    await page.waitForSelector('.programming-problem-statement__name');
  },

  async beforeZOJ(page: Page): Promise<void> {
    await page.waitForSelector('div[class^="problemSetContainer"] div[class^="title"]');
  },
};
