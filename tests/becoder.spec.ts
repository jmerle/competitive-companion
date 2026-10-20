import * as fs from 'node:fs';
import { Browser, launch, Page } from 'puppeteer';
import type { BeCoderProblemParser } from '../src/parsers/problem/BeCoderProblemParser';

declare global {
  interface Window {
    BeCoderProblemParser: BeCoderProblemParser;
  }
}

const exposeParsersScript = fs.readFileSync(new URL('../build-test/expose-parsers.js', import.meta.url), 'utf-8');
const problemUrl = 'https://www.becoder.com.cn/front-v2/problems/56210?contest_id=7890&contest_problem=1';
const apiUrl = 'https://www.becoder.com.cn/api/front-v2/problems/56210?contest_id=7890&contest_problem=1';

let browser: Browser;
let page: Page;
let response: object;

beforeAll(async () => {
  browser = await launch({ headless: process.env.HEADLESS !== 'false' });
});

beforeEach(async () => {
  page = await browser.newPage();
  response = { success: false, error: 'Contest access required' };
  await page.setRequestInterception(true);
  page.on('request', request => {
    if (request.isNavigationRequest()) {
      void request.respond({ status: 200, contentType: 'text/html', body: '<html><body></body></html>' });
    } else if (request.url() === apiUrl) {
      void request.respond({ status: 200, contentType: 'application/json', body: JSON.stringify(response) });
    } else {
      void request.respond({ status: 403 });
    }
  });
  await page.goto(problemUrl);
  await page.evaluate(exposeParsersScript);
});

afterEach(async () => {
  await page.close();
});

afterAll(async () => {
  await browser.close();
});

test('parses numbered and paragraph-labelled samples without losing highlighted text or HTML entities', async () => {
  response = {
    success: true,
    problem: {
      title: 'Cut and Reorder',
      timeLimit: 2800,
      memoryLimit: 524,
      typeText: '传统',
      fileIO: false,
      example: [
        '<h4>输入样例 #1</h4><pre><code><span>5</span> 1\n3 1 4 1 5\n</code></pre>',
        '<h4>输出样例 #1</h4><pre>12\n</pre>',
        '<p><strong>样例输入 2</strong></p><pre>&lt;a&gt; &amp; b\n</pre>',
        '<p><strong>样例输出 2</strong></p><pre>yes\n</pre>',
      ].join(''),
    },
  };

  const result = await page.evaluate(() =>
    window.BeCoderProblemParser.parse(window.location.href, document.documentElement.outerHTML),
  );

  expect(result).toMatchObject({
    name: 'Cut and Reorder',
    url: problemUrl,
    timeLimit: 2800,
    memoryLimit: 524,
    tests: [
      { input: '5 1\n3 1 4 1 5\n', output: '12\n' },
      { input: '<a> & b\n', output: 'yes\n' },
    ],
  });
});

test('keeps output-only samples separate and imports file IO and interactive metadata', async () => {
  response = {
    success: true,
    problem: {
      title: 'Hello, World!',
      timeLimit: 1000,
      memoryLimit: 256,
      typeText: '交互',
      fileIO: true,
      fileIOInputName: 'hello.in',
      fileIOOutputName: 'hello.out',
      example: '<h4>样例输出 1</h4><pre>Hello, World!\n</pre><h4>样例输出 2</h4><pre>hello, WORLD!\n</pre>',
    },
  };

  const result = await page.evaluate(() =>
    window.BeCoderProblemParser.parse(window.location.href, document.documentElement.outerHTML),
  );

  expect(result.tests).toEqual([
    { input: '', output: 'Hello, World!\n' },
    { input: '', output: 'hello, WORLD!\n' },
  ]);
  expect(result.interactive).toBe(true);
  expect(result.input).toEqual({ type: 'file', fileName: 'hello.in' });
  expect(result.output).toEqual({ type: 'file', fileName: 'hello.out' });
});

test('reports access denial instead of exporting an empty problem', async () => {
  await expect(page.evaluate(() => window.BeCoderProblemParser.parse(window.location.href, ''))).rejects.toThrow(
    'Contest access required',
  );
});

test('rejects a sample input without its output', async () => {
  response = {
    success: true,
    problem: {
      title: 'Incomplete sample',
      timeLimit: 1000,
      memoryLimit: 256,
      typeText: '传统',
      fileIO: false,
      example: '<h4>样例输入</h4><pre>1 2\n</pre>',
    },
  };

  await expect(page.evaluate(() => window.BeCoderProblemParser.parse(window.location.href, ''))).rejects.toThrow(
    'no corresponding output',
  );
});
