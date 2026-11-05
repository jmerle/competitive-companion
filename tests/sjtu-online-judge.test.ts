import * as assert from 'node:assert/strict';
import * as fs from 'node:fs';
import * as path from 'node:path';
import { after, before, test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { Browser, launch, Page } from 'puppeteer';

const url = 'https://acm.sjtu.edu.cn/OnlineJudge/problem/1002';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const script = fs.readFileSync(path.resolve(__dirname, '../build-test/expose-parsers.js'), 'utf-8');
const fixture = (name: string): string =>
  fs.readFileSync(path.resolve(__dirname, 'fixtures/sjtu-online-judge', `${name}.html`), 'utf-8');

let browser: Browser;
let page: Page;

before(async () => {
  browser = await launch({ headless: true });
  page = await browser.newPage();
});

after(async () => {
  await browser?.close();
});

async function parse(html: string, addCopyButtons: boolean = false): Promise<any> {
  await page.setContent(html);
  if (addCopyButtons) {
    // Match the buttons appended inside <pre> by the OJ's render.js.
    await page.evaluate(() => {
      document.querySelectorAll('pre').forEach((block, index) => {
        const code = block.querySelector('code');
        if (code) code.id = `code_highlighted_${index}`;
        const button = document.createElement('button');
        button.id = `copy_button_${index}`;
        button.setAttribute('data-clipboard-target', `#code_highlighted_${index}`);
        button.textContent = '复制';
        block.appendChild(button);
      });
    });
  }
  await page.evaluate(script);
  return page.evaluate(
    url => (window as any).SJTUOnlineJudgeProblemParser.parse(url, document.documentElement.outerHTML),
    url,
  );
}

test('registers the parser and matches only SJTU problem pages', async () => {
  await page.setContent(fixture('modern'));
  await page.evaluate(script);
  const result = await page.evaluate(() => {
    const parser = (window as any).SJTUOnlineJudgeProblemParser;
    if (!parser) return null;
    return {
      valid: [
        'https://acm.sjtu.edu.cn/OnlineJudge/problem/1002',
        'http://acm.sjtu.edu.cn/OnlineJudge/problem/11002/',
        'https://acm.sjtu.edu.cn/OnlineJudge/problem/1002?from=contest#examples',
      ].map(url => parser.getRegularExpressions().some((r: RegExp) => r.test(url))),
      invalid: [
        'https://acm.sjtu.edu.cn/OnlineJudge/problem/1002/submit',
        'https://acm.sjtu.edu.cn/OnlineJudge/problem/1002/discussion',
        'https://acm.sjtu.edu.cn/OnlineJudge/problem/abc',
        'https://acm.sjtu.edu.cn/OnlineJudge/login',
        'https://example.com/OnlineJudge/problem/1002',
      ].map(url => parser.getRegularExpressions().some((r: RegExp) => r.test(url))),
      canHandle: parser.canHandlePage(),
    };
  });
  assert.deepEqual(result, {
    valid: [true, true, true],
    invalid: [false, false, false, false, false],
    canHandle: true,
  });
});

test('parses modern samples, empty IO and maximum limits without navigation or explanation text', async () => {
  const result = await parse(fixture('modern'));
  assert.equal(typeof result.batch.id, 'string');
  assert.equal(result.batch.size, 1);
  delete result.batch;
  assert.deepEqual(result, {
    name: '1002. Fixture & Samples',
    group: 'SJTU Online Judge',
    url,
    interactive: false,
    memoryLimit: 256,
    timeLimit: 2500,
    tests: [
      { input: '2\n  1 < 3\n', output: 'yes & yes\n' },
      { input: '', output: 'hello\n' },
      { input: '0\n', output: '' },
    ],
    testType: 'single',
    input: { type: 'stdin' },
    output: { type: 'stdout' },
    languages: { java: { mainClass: 'Main', taskClass: 'FixtureSamples' } },
  });
});

test('parses legacy samples and single limits', async () => {
  const result = await parse(fixture('legacy'));
  assert.equal(result.name, '11002. Legacy Samples');
  assert.equal(result.timeLimit, 1500);
  assert.equal(result.memoryLimit, 128);
  assert.deepEqual(result.tests, [
    { input: '1 2\n', output: '3\n' },
    { input: '3 4\n', output: '7\n' },
  ]);
});

test('handles legacy samples rendered as paragraphs with line breaks', async () => {
  const html = fixture('legacy')
    .replace(/<div id="example-input">[\s\S]*?<\/div>/, '<div id="example-input"><p>1 2<br>3 4</p></div>')
    .replace(/<div id="example-output">[\s\S]*?<\/div>/, '<div id="example-output"><p>3<br>7</p></div>');
  assert.deepEqual((await parse(html)).tests, [{ input: '1 2\n3 4\n', output: '3\n7\n' }]);
});

test('leaves absent limits at TaskBuilder defaults', async () => {
  const result = await parse(fixture('modern').replace('id="plan-summary"', 'id="no-limits"'));
  assert.equal(result.timeLimit, 1000);
  assert.equal(result.memoryLimit, 1024);
});

test('handles unlimited ranges without NaN or Infinity in JSON', async () => {
  const html = fixture('modern')
    .replace('1000 ms min, 2500 ms max', '1000 ms min, 无限制 max')
    .replace('64 MiB min, 256 MiB max', '无限制');
  const result = await parse(html);
  assert.equal(result.timeLimit, 1000);
  assert.equal(result.memoryLimit, 1024);
});

test('handles a statement with no samples', async () => {
  assert.deepEqual((await parse(fixture('modern').replace('id="examples"', 'id="no-examples"'))).tests, []);
});

test('does not claim login or submission pages', async () => {
  for (const html of ['<h1>登录</h1>', '<h1><span class="title-nav__title">1002. Title</span></h1><form></form>']) {
    await page.setContent(html);
    await page.evaluate(script);
    assert.equal(await page.evaluate(() => (window as any).SJTUOnlineJudgeProblemParser.canHandlePage()), false);
  }
});

test('excludes rendered copy buttons from modern and legacy samples', async () => {
  for (const name of ['modern', 'legacy']) {
    const expected = (await parse(fixture(name))).tests;
    const actual = (await parse(fixture(name), true)).tests;
    assert.deepEqual(actual, expected, name);
  }
});

test('preserves the word 复制 when it is actual sample data', async () => {
  const html = fixture('modern').replace('yes &amp; yes', '最后一行复制');
  const result = await parse(html, true);
  assert.equal(result.tests[0].output, '最后一行复制\n');
});

test('extracts both sample pairs shown in the reported screenshot', async () => {
  const samples = [
    { input: '6 2\n0 5\n0 2\n1 1\n1 2\n5 1\n5 1', output: '1 0\n2 0\n2 2\n2 3\n1 5\n2 5' },
    { input: '3 2\n0 5\n0 2\n10 1', output: '1 0\n2 0\n1 10' },
  ];
  const html = `<h1><span class="title-nav__title">1002. Samples</span></h1>
    <div id="problem-description"><div id="examples">${samples
      .map(
        sample => `<div class="example"><div class="row">
          <div class="col-md-6"><pre><code>${sample.input}</code></pre></div>
          <div class="col-md-6"><pre><code>${sample.output}</code></pre></div>
        </div></div>`,
      )
      .join('')}</div></div>`;
  assert.deepEqual(
    (await parse(html, true)).tests,
    samples.map(sample => ({ input: `${sample.input}\n`, output: `${sample.output}\n` })),
  );
});
