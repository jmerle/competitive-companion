import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Browser, launch, Page } from 'puppeteer';
import { Task } from '../src/models/Task';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const exposeParsersScript = fs.readFileSync(path.resolve(testDirectory, '../build-test/expose-parsers.js'), 'utf-8');

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ headless: process.env.HEADLESS !== 'false' });
});

beforeEach(async () => {
  page = await browser.newPage();
  await page.evaluate(exposeParsersScript);
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
});

async function parseSamples(
  statement: string,
  translatedStatement: string = null,
): Promise<{ task: Task; requestedUrls: string[] }> {
  return page.evaluate(
    async ({ statement, translatedStatement }) => {
      const html = `<div class="uoj-content"><h1 class="page-header">#837. Sample Parsing</h1>
      <div id="tab-statement"><article class="uoj-article">${statement}</article></div></div>`;
      const requestedUrls: string[] = [];
      window.fetch = async url => {
        requestedUrls.push(String(url));
        return new Response(
          translatedStatement === null
            ? 'Not found'
            : `<div id="tab-statement"><article class="uoj-article">${translatedStatement}</article></div>`,
          { status: translatedStatement === null ? 404 : 200 },
        );
      };
      const task: Task = await (window as any).QOJProblemParser.parse('https://qoj.ac/problem/837/statement/en', html);
      return { task, requestedUrls };
    },
    { statement, translatedStatement },
  );
}

test('qoj does not mistake an explanation table for samples or stop language fallback', async () => {
  const { task, requestedUrls } = await parseSamples(
    `<h3>Explanation</h3><table><tr><th>Wrong code</th><th>Correct code</th></tr>
      <tr><td><pre>return 0;</pre></td><td><pre>return 1;</pre></td></tr></table>`,
    '<h4>样例输入 1</h4><pre>5 7</pre><h4>样例输出 1</h4><pre>12</pre>',
  );
  expect(task.tests).toEqual([{ input: '5 7\n', output: '12\n' }]);
  expect(requestedUrls).toEqual(['https://qoj.ac/problem/837/statement/zh_cn']);
});

test.each(['<tr><th>Input</th><th>Output</th></tr>', '<tr><td>样例输入</td><td>样例输出</td></tr>'])(
  'qoj recognizes an explicit sample table header (%s)',
  async header => {
    const { task } = await parseSamples(
      `<table>${header}<tr><td><pre>2 3</pre></td><td><pre>5</pre></td></tr>
        <tr><td><pre>3 4</pre></td><td><pre>7</pre></td></tr></table>`,
    );
    expect(task.tests).toEqual([
      { input: '2 3\n', output: '5\n' },
      { input: '3 4\n', output: '7\n' },
    ]);
  },
);

test.each(['Sample 1', 'Examples', '样例'])('qoj recognizes a table in the %s section', async heading => {
  const { task } = await parseSamples(
    `<h3>${heading}</h3><table><tr><td><pre>2 3</pre></td><td><pre>5</pre></td></tr></table>
      <h3>Explanation</h3><table><tr><td><pre>not input</pre></td><td><pre>not output</pre></td></tr></table>`,
  );
  expect(task.tests).toEqual([{ input: '2 3\n', output: '5\n' }]);
});

test('qoj ignores code in table captions and source-code blocks', async () => {
  const { task } = await parseSamples(
    `<table><caption><pre>not a sample row</pre></caption>
      <tr><th>Input</th><th>Output</th></tr>
      <tr><td><pre class="sh_sourceCode">code</pre></td><td><pre class="sh_sourceCode">more code</pre></td></tr>
      <tr><td><pre>2 3</pre></td><td><pre>5</pre></td></tr></table>`,
  );
  expect(task.tests).toEqual([{ input: '2 3\n', output: '5\n' }]);
});

test('qoj keeps headed and table samples in statement order', async () => {
  const { task } = await parseSamples(
    `<h4>Input 1</h4><pre>1</pre><h4>Output 1</h4><pre>11</pre>
      <table><tr><th>Input 2</th><th>Output 2</th></tr><tr><td><pre>2</pre></td><td><pre>22</pre></td></tr></table>
      <h4>样例输入 3</h4><pre>3</pre><h4>样例输出 3</h4><pre>33</pre>`,
  );
  expect(task.tests).toEqual([
    { input: '1\n', output: '11\n' },
    { input: '2\n', output: '22\n' },
    { input: '3\n', output: '33\n' },
  ]);
});

test('qoj does not pair sample blocks with different explicit numbers', async () => {
  const { task } = await parseSamples(
    `<h4>Sample Input 1</h4><pre>one</pre><h4>Sample Output 2</h4><pre>two</pre>
      <h4>Sample Output 1</h4><pre>orphan output</pre>
      <h4>样例输入 3</h4><pre>3</pre><h4>样例输出 3</h4><pre>33</pre>`,
  );
  expect(task.tests).toEqual([{ input: '3\n', output: '33\n' }]);
});

test('qoj keeps literal HTML-looking sample text while converting actual line breaks', async () => {
  const { task } = await parseSamples(
    `<h4>Input 1</h4><pre><code>&lt;br&gt;\n&amp;nbsp;</code></pre><h4>Output 1</h4><pre>&lt;br&gt;</pre>
      <h4>Input 2</h4><pre>  1<br>2<br/>3</pre><h4>Output 2</h4><pre>6<br>7</pre>`,
  );
  expect(task.tests).toEqual([
    { input: '<br>\n&nbsp;\n', output: '<br>\n' },
    { input: '  1\n2\n3\n', output: '6\n7\n' },
  ]);
});

test('qoj preserves literal HTML and actual line breaks in table samples', async () => {
  const { task } = await parseSamples(
    `<table><tr><th>Input</th><th>Output</th></tr>
      <tr><td><pre>&lt;br&gt;<br>&amp;nbsp;</pre></td><td><pre>&lt;br&gt;</pre></td></tr></table>`,
  );
  expect(task.tests).toEqual([{ input: '<br>\n&nbsp;\n', output: '<br>\n' }]);
});
