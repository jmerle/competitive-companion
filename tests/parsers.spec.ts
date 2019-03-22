/// <reference types="@types/jest" />
/// <reference types="jest-environment-puppeteer" />

// tslint:disable no-implicit-dependencies

import * as fs from 'fs';
import { JSDOM } from 'jsdom';
import fetch from 'node-fetch';
import * as path from 'path';
import { Contest } from '../src/models/Contest';
import { Task } from '../src/models/Task';
import { Parser } from '../src/parsers/Parser';
import { noop } from '../src/utils/noop';

const parserFunctions = require('./parser-functions').default;

// tslint:disable-next-line no-console
console.log('Ignore the "Could not parse CSS stylesheet" errors');

export interface ParserTestData {
  name?: string;
  before?: string;
  url: string;
  parser: string;
  result: Task | Task[];
}

function getWebsites(): string[] {
  const directory = path.resolve(__dirname, 'data/');

  return fs.readdirSync(directory).filter(file => fs.statSync(path.join(directory, file)).isDirectory());
}

function runTests(website: string, type: string): void {
  const directory = path.resolve(__dirname, `data/${website}/${type}/`);

  if (!fs.existsSync(directory)) {
    return;
  }

  const tests: ParserTestData[] = fs
    .readdirSync(directory)
    .map(file => path.join(directory, file))
    .filter(file => fs.statSync(file).isFile())
    .map(file => {
      const data: ParserTestData = require(file);

      data.name = path.basename(file, '.json');

      data.result = Array.isArray(data.result)
        ? data.result.map((t: any) => Task.fromJSON(JSON.stringify(t)))
        : Task.fromJSON(JSON.stringify(data.result));

      return data;
    });

  describe(type, () => {
    tests.forEach(data => {
      test(data.name!, () => {
        return runTest(data);
      });
    });
  });
}

async function runTest(data: ParserTestData): Promise<void> {
  const parserObj = require(`../src/parsers/${data.parser}`);
  const parserClass = parserObj[Object.keys(parserObj)[0]];
  const parser: Parser = new parserClass();

  await page.goto(data.url);

  if (data.before) {
    await parserFunctions[data.before](page);
  }

  const url = page.url();
  const html = await page.content();

  expect(parser.getRegularExpressions().some(r => r.test(url))).toBeTruthy();
  expect(parser.getExcludedRegularExpressions().some(r => r.test(url))).toBeFalsy();
  expect(parser.canHandlePage()).toBeTruthy();

  const result = await parser.parse(url, html);

  const expectedContest = Array.isArray(data.result);
  const resultContest = result instanceof Contest;
  expect(resultContest).toBe(expectedContest);

  if (resultContest) {
    const expectedTasks: Task[] = data.result as Task[];
    const actualTasks: Task[] = (result as Contest).tasks as Task[];

    expect(actualTasks.length).toBe(expectedTasks.length);
    expect(actualTasks).toEqual(expectedTasks);
  } else {
    const expectedTask = data.result as Task;
    const actualTask = result as Task;

    expect(actualTask).toEqual(expectedTask);
  }
}

jest.setTimeout(30000);

beforeAll(async () => {
  const width = await page.evaluate('window.outerWidth');
  const height = await page.evaluate('window.outerHeight');
  await page.setViewport({ width, height });

  page.addListener('load', async () => {
    const html = await page.content();
    const url = page.url();
    const dom = new JSDOM(html, { url });

    (global as any).window = {
      ...dom.window,
      nanoBar: {
        go: noop,
      },
    };

    (global as any).DOMParser = function(): any {
      this.parseFromString = (source: string, mimeType: string): Document => {
        return new JSDOM(source, { url }).window.document;
      };
    };

    (global as any).fetch = fetch;
    (global as any).Node = dom.window.Node;
    (global as any).document = dom.window.document;
  });
});

getWebsites().forEach(website => {
  describe(website, () => {
    runTests(website, 'problem');
    runTests(website, 'contest');
  });
});
