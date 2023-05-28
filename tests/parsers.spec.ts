(global as any).chrome = {
  runtime: {
    id: 'dev',
  },
};

import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { createPool, Pool } from 'generic-pool';
import { Browser, launch, Page } from 'puppeteer';
import { Contest } from '../src/models/Contest';
import { Sendable } from '../src/models/Sendable';
import { Task } from '../src/models/Task';
import { Parser } from '../src/parsers/Parser';
import { beforeFunctions } from './before-functions';

interface TestData {
  url: string;
  parser: string;
  before?: string;
  result: Task | Task[];
}

const exposeParsersScript = fs.readFileSync(path.resolve(__dirname, '../build-test/expose-parsers.js'), {
  encoding: 'utf-8',
});

async function runTest(pagePool: Pool<Page>, data: TestData): Promise<void> {
  const page = await pagePool.acquire();
  let result: Sendable;

  try {
    await page.goto(data.url, { timeout: 15000 });

    if (data.before) {
      await beforeFunctions[data.before](page);
    }

    await page.evaluate(exposeParsersScript);

    result = await page.evaluate(parserName => {
      const url = window.location.href;
      const html = document.documentElement.outerHTML;

      const parser: Parser = (window as any)[parserName];

      if (!parser.getRegularExpressions().some(r => r.test(url))) {
        throw new Error(`parser.getRegularExpressions() returns no regular expressions matching ${url}`);
      }

      if (parser.getExcludedRegularExpressions().some(r => r.test(url))) {
        throw new Error(`parser.getExcludedRegularExpressions() returns a regular expressions matching ${url}`);
      }

      if (!parser.canHandlePage()) {
        throw new Error(`parser.canHandlePage() returns false`);
      }

      return parser.parse(url, html);
    }, data.parser);
  } finally {
    await pagePool.destroy(page);
  }

  const expectedContest = Array.isArray(data.result);
  const resultContest = (result as Contest).tasks !== undefined;
  expect(resultContest).toBe(expectedContest);

  const tasksToCheck: [Task, Task][] = [];

  if (resultContest) {
    const expectedTasks = data.result as Task[];
    const actualTasks = (result as Contest).tasks as Task[];

    expect(actualTasks.length).toBe(expectedTasks.length);

    for (let i = 0; i < expectedTasks.length; i++) {
      expect(actualTasks[i].batch.id).toBe(actualTasks[0].batch.id);
      expect(actualTasks[i].batch.size).toBe(actualTasks.length);

      tasksToCheck.push([expectedTasks[i], actualTasks[i]]);
    }
  } else {
    const expectedTask = data.result as Task;
    const actualTask = result as Task;

    expect(actualTask.batch.size).toBe(1);

    tasksToCheck.push([expectedTask, actualTask]);
  }

  for (const [expectedTask, actualTask] of tasksToCheck) {
    delete expectedTask.batch;
    delete actualTask.batch;

    expect(actualTask).toEqual(expectedTask);
  }
}

let browser: Browser;
let pagePool: Pool<Page>;

beforeAll(async () => {
  browser = await launch({
    headless: process.env.HEADLESS !== 'false' ? 'new' : false,
  });

  pagePool = createPool<Page>(
    {
      create: async () => {
        const context = await browser.createIncognitoBrowserContext();
        return context.newPage();
      },
      destroy: page => page.close(),
    },
    {
      min: 0,
      max: process.env.HEADLESS !== 'false' ? 8 : 1,
    },
  );
});

afterAll(async () => {
  await browser.close();
});

for (const website of fs.readdirSync(path.resolve(__dirname, 'data'))) {
  for (const category of fs.readdirSync(path.resolve(__dirname, 'data', website))) {
    for (const file of fs.readdirSync(path.resolve(__dirname, 'data', website, category))) {
      const testName = `${website}/${category}/${file.substring(0, file.length - 5)}`;

      const filePath = path.resolve(__dirname, 'data', website, category, file);
      const data = JSON.parse(fs.readFileSync(filePath, { encoding: 'utf-8' }));

      test.concurrent(testName, () => runTest(pagePool, data));
    }
  }
}
