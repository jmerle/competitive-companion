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
const preferredEnglish = problemHtml(englishHeader, '<h4>Input 1</h4><pre>1</pre><h4>Output 1</h4><pre>11</pre>');
const preferredChinese = problemHtml(chineseHeader, '<h4>样例输入 1</h4><pre>2</pre><h4>样例输出 1</h4><pre>22</pre>');

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
  responses: Record<string, string | { status: number; body: string }> = {},
  parserName: string = 'QOJProblemParser',
): Promise<Sendable> {
  const navigationUrl = new URL(url);
  navigationUrl.hash = '';
  await page.setRequestInterception(true);
  page.on('request', request => {
    const requestUrl = request.url();
    if (request.resourceType() === 'fetch') {
      requestedUrls.push(requestUrl);
    }
    const normalizedRequestUrl = new URL(requestUrl);
    normalizedRequestUrl.hash = '';
    const response =
      request.resourceType() === 'document' && normalizedRequestUrl.href === navigationUrl.href
        ? html
        : responses[requestUrl];
    if (response === undefined) {
      void request.abort();
    } else {
      const { status, body } = typeof response === 'string' ? { status: 200, body: response } : response;
      void request.respond({ status, contentType: 'text/html; charset=utf-8', body });
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

test('qoj preserves sample indentation and decodes HTML entities inside code elements', async () => {
  const html = problemHtml(
    englishHeader,
    `<h4>Sample Input #1:</h4><pre><code>  &lt;node attr=&quot;x&quot;&gt; &amp; y\n\tvalue\n\n</code></pre>
     <h4>Sample Output #1:</h4><pre><code>  &lt;/node&gt;\n</code></pre>`,
  );
  const task = (await parse(normal.url, html)) as Task;
  expect(task.tests).toEqual([{ input: '  <node attr="x"> & y\n\tvalue\n', output: '  </node>\n' }]);
});

test('qoj parses Malygos samples labeled with bold paragraphs', async () => {
  const fixture = JSON.parse(
    fs.readFileSync(path.resolve(testDirectory, 'data/qoj/problem/paragraph-labels.json'), 'utf-8'),
  );
  const html = problemHtml(
    '<h1 class="page-header text-center">#6. Malygos</h1>',
    `<h3>Example</h3><p><strong>Input</strong></p><pre>4 2\n0\n1\n2\n3</pre>
     <p><strong>Output</strong></p><pre>3.5</pre>`,
    'Time Limit: 1 s|Memory Limit: 256 MB',
  );
  const task = (await parse(fixture.url, html)) as Task;
  delete task.batch;
  expect(task).toEqual(fixture.result);
});

test('qoj collects each complete table sample row in order', async () => {
  const html = problemHtml(
    englishHeader,
    `<table><thead><tr><th>Sample Input</th><th>Sample Output</th></tr></thead><tbody>
      <tr><td><pre>2 3</pre></td><td><pre>5</pre></td></tr>
      <tr><td><pre>3 4</pre></td><td><pre>7</pre></td></tr>
      <tr><td><pre>incomplete sample</pre></td><td></td></tr>
    </tbody></table>`,
  );
  const task = (await parse(normal.url, html)) as Task;
  expect(task.tests).toEqual([
    { input: '2 3\n', output: '5\n' },
    { input: '3 4\n', output: '7\n' },
  ]);
});

test('qoj ignores unpaired sample blocks without dropping complete samples or empty input', async () => {
  const html = problemHtml(
    englishHeader,
    `<h4>Output 0</h4><pre>unpaired output</pre>
     <h4>Input 1</h4><pre>2 3</pre><h4>Output 1</h4><pre>5</pre>
     <h4>Input 2</h4><pre></pre><h4>Output 2</h4><pre>constant</pre>
     <h4>Input 3</h4><pre>unpaired input</pre>`,
  );
  const task = (await parse(normal.url, html)) as Task;
  expect(task.tests).toEqual([
    { input: '2 3\n', output: '5\n' },
    { input: '', output: 'constant\n' },
  ]);
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

test('qoj uses current Chinese samples without requesting an available English translation', async () => {
  const englishUrl = 'https://qoj.ac/contest/2550/problem/837/statement/en';
  const task = (await parse(translated.url, preferredChinese, { [englishUrl]: preferredEnglish })) as Task;
  expect(task.tests).toEqual([{ input: '2\n', output: '22\n' }]);
  expect(requestedUrls).toEqual([]);
});

test('qoj parses current samples before inspecting malformed translation links', async () => {
  const html = `${preferredChinese}<ul class="nav-tabs">
    <li><a href="http://[broken/statement/en">English</a></li>
  </ul>`;
  const task = (await parse(translated.url, html)) as Task;
  expect(task.tests).toEqual([{ input: '2\n', output: '22\n' }]);
  expect(requestedUrls).toEqual([]);
});

test('qoj ignores malformed translation links when it needs an English fallback', async () => {
  const url = 'https://qoj.ac/problem/837';
  const englishUrl = `${url}/statement/en`;
  const html = `${problemHtml(englishHeader, '<p>No examples are provided.</p>')}<ul class="nav-tabs">
    <li><a href="http://[broken/statement/en">English</a></li>
  </ul>`;
  const task = (await parse(url, html, { [englishUrl]: preferredEnglish })) as Task;
  expect(task.tests).toEqual([{ input: '1\n', output: '11\n' }]);
  expect(requestedUrls).toEqual([englishUrl]);
});

test('qoj falls back to English while retaining the current page metadata and query parameters', async () => {
  const url = `${translated.url}?v=4&locale=zh-cn`;
  const englishUrl = 'https://qoj.ac/contest/2550/problem/837/statement/en?v=4&locale=zh-cn';
  const html = `${problemHtml(chineseHeader, '<p>No examples are provided.</p>', 'Time Limit: 1.5 s|Memory Limit: 256 MB')}
    <ul class="nav-tabs">
      <li><a href="https://example.com/contest/2550/problem/837/statement/en">English</a></li>
      <li><a href="/contest/2550/problem/838/statement/en">English</a></li>
    </ul>`;
  const task = (await parse(url, html, { [englishUrl]: preferredEnglish })) as Task;
  expect(task).toMatchObject({
    name: translated.result.name,
    group: translated.result.group,
    url,
    memoryLimit: 256,
    timeLimit: 1500,
    tests: [{ input: '1\n', output: '11\n' }],
  });
  expect(requestedUrls).toEqual([englishUrl]);
});

test('qoj gives current query values precedence over advertised translation values', async () => {
  const url = 'https://qoj.ac/contest/2550/problem/837?v=4&locale=zh-cn&tag=a&tag=b';
  const englishUrl = 'https://qoj.ac/contest/2550/problem/837/statement/en?mode=print&v=4&locale=zh-cn&tag=a&tag=b';
  const html = `${problemHtml(chineseHeader, '<p>No examples are provided.</p>')}<ul class="nav-tabs">
    <li><a href="/contest/2550/problem/837/statement/en?v=99&locale=en&tag=wrong&mode=print">English</a></li>
  </ul>`;
  const task = (await parse(url, html, { [englishUrl]: preferredEnglish })) as Task;
  expect(task).toMatchObject({ url, tests: [{ input: '1\n', output: '11\n' }] });
  expect(requestedUrls).toEqual([englishUrl]);
});

test.each([
  ['returns 404', { status: 404, body: preferredEnglish }],
  ['fails to load', undefined],
  ['only provides a PDF', '<div id="tab-statement"><iframe></iframe></div>'],
  ['contains an empty article', '<div id="tab-statement"><article>\n\t</article></div>'],
  ['does not contain a statement', '<h1>Please log in</h1>'],
  ['has no extractable samples', problemHtml(englishHeader, '<p>No examples are provided.</p>')],
])('qoj probes Chinese once when English %s', async (_, englishResponse) => {
  const url = 'https://qoj.ac/problem/837';
  const englishUrl = `${url}/statement/en`;
  const chineseUrl = `${url}/statement/zh_cn`;
  const task = (await parse(url, problemHtml(englishHeader, '<p>No examples are provided.</p>'), {
    ...(englishResponse === undefined ? {} : { [englishUrl]: englishResponse }),
    [chineseUrl]: preferredChinese,
  })) as Task;
  expect(task.tests).toEqual([{ input: '2\n', output: '22\n' }]);
  expect(requestedUrls).toEqual([englishUrl, chineseUrl]);
});

test('qoj retains a current HTML statement without samples when both translations are missing', async () => {
  const url = 'https://qoj.ac/problem/837/statement/default';
  const englishUrl = 'https://qoj.ac/problem/837/statement/en';
  const chineseUrl = 'https://qoj.ac/problem/837/statement/zh_cn';
  const task = (await parse(url, problemHtml(englishHeader, '<p>No examples are provided.</p>'), {
    [englishUrl]: { status: 404, body: 'Not found' },
    [chineseUrl]: { status: 404, body: 'Not found' },
  })) as Task;
  expect(task.tests).toEqual([]);
  expect(requestedUrls).toEqual([englishUrl, chineseUrl]);
});

test('qoj reuses the current English page across trailing slashes and fragments without requesting it again', async () => {
  const url = 'https://qoj.ac/problem/837/statement/en/?v=7#tab-statement';
  const task = (await parse(url, preferredEnglish)) as Task;
  expect(task).toMatchObject({ url, tests: [{ input: '1\n', output: '11\n' }] });
  expect(requestedUrls).toEqual([]);
});

test.each([
  ['en', 'zh_cn', preferredChinese, [{ input: '2\n', output: '22\n' }]],
  ['zh_cn', 'en', preferredEnglish, [{ input: '1\n', output: '11\n' }]],
])(
  'qoj requests only the other language when the current %s statement has no samples',
  async (language, other, html, tests) => {
    const url = `https://qoj.ac/problem/837/statement/${language}/?v=7#tab-statement`;
    const translationUrl = `https://qoj.ac/problem/837/statement/${other}?v=7`;
    const task = (await parse(url, problemHtml(englishHeader, '<p>No examples are provided.</p>'), {
      [translationUrl]: html,
    })) as Task;
    expect(task).toMatchObject({ url, tests });
    expect(requestedUrls).toEqual([translationUrl]);
  },
);

test('qoj does not re-request the current language when advertised query values conflict', async () => {
  const url = 'https://qoj.ac/problem/837/statement/en/?v=7&locale=en#tab-statement';
  const chineseUrl = 'https://qoj.ac/problem/837/statement/zh_cn?v=7&locale=en';
  const html = `${problemHtml(englishHeader, '<p>No examples are provided.</p>')}<ul class="nav-tabs">
    <li><a href="/problem/837/statement/en?locale=zh-cn&v=99">English</a></li>
  </ul>`;
  const task = (await parse(url, html, { [chineseUrl]: preferredChinese })) as Task;
  expect(task).toMatchObject({ url, tests: [{ input: '2\n', output: '22\n' }] });
  expect(requestedUrls).toEqual([chineseUrl]);
});

test('qoj keeps the first valid HTML statement if no language contains samples', async () => {
  const url = 'https://qoj.ac/problem/837';
  const englishUrl = `${url}/statement/en`;
  const chineseUrl = `${url}/statement/zh_cn`;
  const task = (await parse(url, problemHtml(englishHeader, '<p>This is an interactive problem.</p>'), {
    [englishUrl]: problemHtml(englishHeader, '<p>No samples.</p>'),
    [chineseUrl]: problemHtml(chineseHeader, '<p>No samples.</p>'),
  })) as Task;
  expect(task).toMatchObject({ interactive: true, tests: [] });
  expect(requestedUrls).toEqual([englishUrl, chineseUrl]);
});

test.each([
  ['', '', '', ''],
  ['', '', '', '<article class="uoj-article">\n\t</article>'],
  ['?v=1', '', '?v=1', ''],
  ['?v=1', '?v=2', '?v=1', ''],
])(
  'qoj obtains PDF samples from advertised HTML and preserves metadata (%s, %s, %s, %s)',
  async (suffix, linkSuffix, targetSuffix, emptyArticle) => {
    const problemUrl = 'https://qoj.ac/contest/2550/problem/837';
    const url = `${problemUrl}${suffix}`;
    const translationUrl = `${problemUrl}/statement/en${targetSuffix}`;
    const html = problemHtml(chineseHeader, '').replace(
      '<div id="tab-statement"><article class="uoj-article"></article></div>',
      `<ul class="nav-tabs"><li><a href="/contest/2550/problem/837/statement/en${linkSuffix}">English</a></li></ul>
     <div id="tab-statement">${emptyArticle}<iframe></iframe></div>`,
    );
    const task = (await parse(url, html, { [translationUrl]: problemHtml(englishHeader, englishSamples) })) as Task;
    expect(task).toMatchObject({ ...translated.result, url });
    expect(requestedUrls).toEqual([translationUrl]);
  },
);

test.each(['', '<article class="uoj-article">\n\t</article>'])(
  'qoj reports an unsupported PDF statement instead of returning an empty task (%s)',
  async emptyArticle => {
    const html = problemHtml(englishHeader, '').replace(
      '<article class="uoj-article"></article>',
      `${emptyArticle}<iframe></iframe>`,
    );
    await expect(parse(normal.url, html)).rejects.toThrow(/(?:HTML|PDF).*statement/i);
  },
);

test.each([
  ['the translation request fails', undefined],
  ['the translation response has no statement', '<h1>Please log in</h1>'],
  [
    'the translation still only has a PDF statement',
    '<div id="tab-statement"><article class="uoj-article">\n\t</article><iframe></iframe></div>',
  ],
])('qoj rejects PDF parsing when %s', async (_, response) => {
  const url = 'https://qoj.ac/problem/837';
  const translationUrl = `${url}/statement/en`;
  const html = problemHtml(englishHeader, '').replace(
    '<div id="tab-statement"><article class="uoj-article"></article></div>',
    `<ul class="nav-tabs"><li><a href="${translationUrl}">English</a></li></ul>
     <div id="tab-statement"><iframe></iframe></div>`,
  );
  await expect(parse(url, html, response === undefined ? {} : { [translationUrl]: response })).rejects.toThrow(
    /(?:HTML|PDF).*statement/i,
  );
  expect(requestedUrls).toEqual([translationUrl, `${url}/statement/zh_cn`]);
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

test('qoj problem and contest URLs each have exactly one matching registered parser', async () => {
  await page.evaluate(exposeParsersScript);
  const matches = await page.evaluate(() => {
    const parserNames = Object.keys(window).filter(
      name => name.endsWith('Parser') && typeof (window as any)[name]?.getRegularExpressions === 'function',
    );
    return ['https://qoj.ac/contest/2550/problem/837', 'https://qoj.ac/contest/2550'].map(url =>
      parserNames.filter(name => {
        const parser: Parser = (window as any)[name];
        return (
          parser.getRegularExpressions().some(pattern => pattern.test(url)) &&
          !parser.getExcludedRegularExpressions().some(pattern => pattern.test(url))
        );
      }),
    );
  });
  expect(matches).toEqual([['QOJProblemParser'], ['QOJContestParser']]);
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

test('qoj deduplicates normalized contest URLs while preserving the first URL and current revision', async () => {
  const url = 'https://qoj.ac/contest/2550?v=1';
  const problemUrl = 'https://qoj.ac/contest/2550/problem/837';
  const firstUrl = `${problemUrl}/?locale=en&v=1#tab-statement`;
  const html = `<div class="top-buffer-md"><div class="table-responsive"><table class="table"><tbody>
    <tr><td><a href="${problemUrl}/?locale=en&v=99#tab-statement">Giant Penguin</a></td>
      <td><a href="${problemUrl}?v=1&locale=en">837</a></td>
      <td><a href="${problemUrl}?locale=en&v=1#samples">Samples</a></td>
      <td><a href="http://[broken/problem/838">Invalid link</a></td></tr>
  </tbody></table></div></div>`;
  const result = (await parse(url, html, { [firstUrl]: preferredEnglish }, 'QOJContestParser')) as Contest;
  const tasks = result.tasks as Task[];
  expect(requestedUrls).toEqual([firstUrl]);
  expect(tasks).toHaveLength(1);
  expect(tasks[0]).toMatchObject({ url: firstUrl, tests: [{ input: '1\n', output: '11\n' }], batch: { size: 1 } });
});
