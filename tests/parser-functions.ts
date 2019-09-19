// tslint:disable no-implicit-dependencies

import { Page } from 'puppeteer';

export default {
  async beforeACMP(page: Page): Promise<void> {
    await page.setRequestInterception(true);

    page.on('request', interceptedRequest => {
      if (interceptedRequest.url().includes('digitaltarget.ru')) {
        interceptedRequest.abort();
      } else {
        interceptedRequest.continue();
      }
    });
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
    await page.waitFor('.problems-nav-problem-btn');
    await page.click('.problems-nav-problem-btn');
    await page.waitFor('.problem-description');
  },

  async beforeOldGoogleCodeJam(page: Page): Promise<void> {
    await page.waitFor('#dsb-problem-title0');
  },

  async beforePandaOnlineJudge(page: Page): Promise<void> {
    await page.waitFor('.mat-card-title');
    await page.waitFor('pre.sample-box');
  },

  async beforeQDUOJ(page: Page): Promise<void> {
    await page.waitFor(() => /(\d+)MS/.test(document.body.innerHTML));
  },
};
