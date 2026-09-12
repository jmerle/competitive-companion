import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Browser, launch, Page } from 'puppeteer';
import { Contest } from '../src/models/Contest';
import { Sendable } from '../src/models/Sendable';
import { Task } from '../src/models/Task';
import { Parser } from '../src/parsers/Parser';

const testDirectory = path.dirname(fileURLToPath(import.meta.url));
const exposeParsersScript = fs.readFileSync(path.resolve(testDirectory, '../build-test/expose-parsers.js'), 'utf-8');
const normal = JSON.parse(fs.readFileSync(path.resolve(testDirectory, 'data/qoj/problem/normal.json'), 'utf-8'));
const translated = JSON.parse(
  fs.readFileSync(path.resolve(testDirectory, 'data/qoj/problem/contest-translated.json'), 'utf-8'),
);

// Keep only public statement data; saved QOJ pages also contain account and submission form data.
function problemHtml(
  header: string,
  statement: string,
  limits: string = 'Time Limit: 3 s|Memory Limit: 512 MB',
): string {
  return `<div class="uoj-content">
    <div class="row">${limits
      .split('|')
      .map(limit => `<span class="badge">${limit}</span>`)
      .join('')}</div>
    ${header}
    <div id="tab-statement"><article class="uoj-article">${statement}</article></div>
  </div>`;
}

const englishHeader = '<h1 class="page-header text-center">#837. Giant Penguin</h1>';
const chineseHeader = `<div class="page-header row">
  <div><h1><small>IOI 2026 中国国家集训队作业（试题泛做）</small></h1></div>
  <div><h1 class="text-center">2.\n 巨型企鹅</h1></div>
</div>`;
const englishSamples = normal.result.tests
  .map(
    (sample: { input: string; output: string }, i: number) =>
      `<h4>Input ${i + 1}</h4><pre>${sample.input}</pre><h4>Output ${i + 1}</h4><pre>${sample.output}</pre>`,
  )
  .join('');
const chineseSamples = translated.result.tests
  .map(
    (sample: { input: string; output: string }, i: number) =>
      `<h4>样例输入 ${i + 1}</h4><pre>${sample.input}</pre><h4>样例输出 ${i + 1}</h4><pre>${sample.output}</pre>`,
  )
  .join('');

let browser: Browser;
let page: Page;
let requestedUrls: string[];

beforeAll(async () => {
  browser = await launch({ headless: process.env.HEADLESS !== 'false' });
});

beforeEach(async () => {
  page = await browser.newPage();
  requestedUrls = [];
  page.on('dialog', dialog => dialog.dismiss());
});

afterEach(async () => {
  await page?.close();
});

afterAll(async () => {
  await browser?.close();
});

async function parse(
  url: string,
  html: string,
  responses: Record<string, string> = {},
  parserName: string = 'QOJProblemParser',
): Promise<Sendable> {
  await page.setRequestInterception(true);
  page.on('request', request => {
    const requestUrl = request.url();
    if (request.resourceType() === 'fetch') {
      requestedUrls.push(requestUrl);
    }
    const body = requestUrl === url ? html : responses[requestUrl];
    if (body === undefined) {
      void request.abort();
    } else {
      void request.respond({ status: 200, contentType: 'text/html; charset=utf-8', body });
    }
  });
  await page.goto(url);
  await page.evaluate(exposeParsersScript);
  return page.evaluate(async name => {
    const parser: Parser = (window as any)[name];
    return parser.parse(window.location.href, document.documentElement.outerHTML);
  }, parserName);
}

test.each([
  ['ordinary English statement', normal, englishHeader, englishSamples],
  ['translated contest statement', translated, chineseHeader, chineseSamples],
])('qoj parses %s', async (_, fixture, header, samples) => {
  const task = (await parse(fixture.url, problemHtml(header, samples))) as Task;
  expect(task.batch.size).toBe(1);
  delete task.batch;
  expect(task).toEqual(fixture.result);
});

test('qoj ignores input formats, explanations, and code blocks outside the statement', async () => {
  const html = problemHtml(
    englishHeader,
    `<h3>Input Format</h3><pre>n m</pre><h3>Output Format</h3><pre>answer</pre>
     ${englishSamples}
     <h3>Explanation</h3><pre>not an input</pre><pre>not an output</pre>`,
  );
  const task = (await parse(normal.url, `${html}<pre>source code</pre><pre>compiler output</pre>`)) as Task;
  expect(task.tests).toEqual(normal.result.tests);
});

test('qoj parses table samples and localized resource limits', async () => {
  const html = problemHtml(
    englishHeader,
    '<table><tr><th>Sample Input</th><th>Sample Output</th></tr><tr><td><pre>2 3</pre></td><td><pre>5</pre></td></tr></table>',
    '时间限制：1.5 s|空间限制：256 MB',
  );
  const task = (await parse(normal.url, html)) as Task;
  expect(task).toMatchObject({ timeLimit: 1500, memoryLimit: 256, tests: [{ input: '2 3\n', output: '5\n' }] });
});

test('qoj accepts an HTML statement without sample cases', async () => {
  const task = (await parse(
    normal.url,
    problemHtml(englishHeader, '<h3>Task</h3><p>No examples are provided.</p>'),
  )) as Task;
  expect(task.tests).toEqual([]);
});

test.each([
  ['<p>This is a non-interactive problem.</p>', false],
  ['<p>This is an interactive problem.</p>', true],
  ['<h3>Interaction Protocol</h3><p>Send a query and read the response.</p>', true],
  ['<h3>交互格式</h3><p>输出询问并读入回答。</p>', true],
])('qoj detects explicit interactive statements (%s)', async (statement, interactive) => {
  const task = (await parse(normal.url, problemHtml(englishHeader, statement))) as Task;
  expect(task.interactive).toBe(interactive);
});

test.each([
  ['', '', ''],
  ['?v=1', '', '?v=1'],
  ['?v=1', '?v=2', '?v=2'],
])(
  'qoj obtains PDF samples from advertised HTML and preserves metadata (%s, %s)',
  async (suffix, linkSuffix, targetSuffix) => {
    const problemUrl = 'https://qoj.ac/contest/2550/problem/837';
    const url = `${problemUrl}${suffix}`;
    const translationUrl = `${problemUrl}/statement/en${targetSuffix}`;
    const html = problemHtml(chineseHeader, '').replace(
      '<div id="tab-statement"><article class="uoj-article"></article></div>',
      `<ul class="nav-tabs"><li><a href="/contest/2550/problem/837/statement/en${linkSuffix}">English</a></li></ul>
     <div id="tab-statement"><iframe></iframe></div>`,
    );
    const task = (await parse(url, html, { [translationUrl]: problemHtml(englishHeader, englishSamples) })) as Task;
    expect(task).toMatchObject({ ...translated.result, url });
    expect(requestedUrls).toEqual([translationUrl]);
  },
);

test('qoj reports an unsupported PDF statement instead of returning an empty task', async () => {
  const html = problemHtml(englishHeader, '').replace('<article class="uoj-article"></article>', '<iframe></iframe>');
  await expect(parse(normal.url, html)).rejects.toThrow(/PDF/i);
});

test('qoj only matches problem and contest pages, including translated statements and URL suffixes', async () => {
  await page.evaluate(exposeParsersScript);
  const urls = [
    'https://qoj.ac/problem/837',
    'https://qoj.ac/problem/837/statement/en?locale=en#tab-statement',
    'https://qoj.ac/contest/2550/problem/837/statement/zh_cn',
    'https://qoj.ac/contest/2550/problem/837/',
    'https://qoj.ac/problem/837/statistics',
    'https://qoj.ac/problem/837/discussion/1549',
    'https://qoj.ac/problem/list',
    'https://qoj.ac/contest/2550',
    'https://qoj.ac/contest/2550/?locale=en#problems',
    'https://qoj.ac/contest/2550/standings',
    'https://qoj.ac/contest/2550/submissions',
    'https://qoj.ac/contest/list',
  ];
  const matches = await page.evaluate(candidates => {
    return ['QOJProblemParser', 'QOJContestParser'].map(name => {
      const parser: Parser = (window as any)[name];
      return candidates.filter(url => parser.getRegularExpressions().some(pattern => pattern.test(url)));
    });
  }, urls);
  expect(matches).toEqual([urls.slice(0, 4), urls.slice(7, 9)]);
});

test.each(['', '?v=1'])('qoj collects contest problems once and assigns one batch (%s)', async suffix => {
  const contestUrl = 'https://qoj.ac/contest/2550';
  const url = `${contestUrl}${suffix}`;
  const firstUrl = `${contestUrl}/problem/837${suffix}`;
  const secondUrl = `${contestUrl}/problem/838${suffix}`;
  const html = `<div class="top-buffer-md"><div class="table-responsive"><table class="table"><tbody>
    <tr><td><a href="/contest/2550/problem/837">1</a></td>
      <td><a href="${contestUrl}/problem/837">Giant Penguin</a></td>
      <td><a href="${contestUrl}/problem/837/statistics">Statistics</a></td></tr>
    <tr><td><a href="${contestUrl}/problem/838">Next problem</a></td>
      <td><a href="${contestUrl}/problem/838/statistics">Statistics</a></td></tr>
  </tbody></table></div></div>`;
  const result = (await parse(
    url,
    html,
    {
      [firstUrl]: problemHtml(chineseHeader, chineseSamples),
      [secondUrl]: problemHtml('<h1 class="page-header text-center">#838. Next Problem</h1>', englishSamples),
    },
    'QOJContestParser',
  )) as Contest;
  const tasks = result.tasks as Task[];
  expect(requestedUrls.sort()).toEqual([firstUrl, secondUrl]);
  expect(tasks.map(task => task.url)).toEqual([firstUrl, secondUrl]);
  expect(tasks[0].batch).toEqual({ id: expect.any(String), size: 2 });
  expect(tasks[1].batch).toEqual(tasks[0].batch);
});
