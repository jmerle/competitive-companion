import { Page } from 'puppeteer';
import { ParserTestData } from './parsers.spec';
import { Task } from '../src/models/Task';

function timeout(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export default {
  async beforeCodeChef(page: Page, data: ParserTestData) {
    await page.waitFor('.breadcrumbs a');
  },

  async beforeCOJContest(page: Page, data: ParserTestData) {
    await page.waitFor('#problem td > a');
  },

  async beforeCSAcademy(page: Page, data: ParserTestData) {
    await page.waitFor('h1');
  },

  async beforeHackerEarth(page: Page, data: ParserTestData) {
    await page.type('#id_login', process.env.HACKER_EARTH_EMAIL);
    await page.type('#id_password', process.env.HACKER_EARTH_PASSWORD);
    await page.click('.track-login');
    await page.waitForNavigation({ waitUntil: 'load' });
  },

  async beforeHackerRank(page: Page, data: ParserTestData) {
    await page.waitFor('.login');
    await page.click('.login');
    await page.type('#legacy-login input[name=login]', process.env.HACKER_RANK_EMAIL);
    await page.type('#legacy-login input[name=password]', process.env.HACKER_RANK_PASSWORD);
    await page.click('.login-button');
    await page.waitFor('.avatar');
    await page.goto(data.url);
    await page.waitFor('.challenges-list a.btn');
  },

  async beforeLightOJ(page: Page, data: ParserTestData) {
    const login = await page.$('#myuserid');

    if (login !== null) {
      await page.type('#myuserid', process.env.LIGHT_OJ_EMAIL);
      await page.type('#mypassword', process.env.LIGHT_OJ_PASSWORD);
      await page.click('input[type=submit]');
      await page.waitFor('#problem_name');
    }
  },

  async beforeOldGoogleCodeJam(page: Page, data: ParserTestData) {
    await page.waitFor('#dsb-problem-title0');
  },

  async beforeNewGoogleCodeJam(page: Page, data: ParserTestData) {
    await page.waitFor('.adventures > tr:last-child > td:nth-child(4) > a');
    await page.click('.adventures > tr:last-child > td:nth-child(4) > a');
    await page.waitFor('.collection > a:nth-child(2)');
    await page.click('.collection > a:nth-child(2)');
  },

  async beforeUSACOTraining(page: Page, data: ParserTestData) {
    await page.type('input[name=NAME]', process.env.USACO_TRAINING_USERNAME);
    await page.type('input[name=PASSWORD]', process.env.USACO_TRAINING_PASSWORD);
    await page.click('input[name=SUBMIT]');

    const linkSelector = 'table > tbody > tr > td:nth-child(3) > table a';

    await page.waitFor(linkSelector);

    const link: string = await page.$eval(linkSelector, a => (a as any).href);
    const hash = /\?a=([a-zA-Z0-9]+)&/.exec(link)[1];

    const url = `http://train.usaco.org/usacoprob2?a=${hash}&S=ride`;
    data.url = url;
    (data.result as Task).url = url;

    await page.goto(url);
  },
};
