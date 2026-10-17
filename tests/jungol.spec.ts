/// <reference types="jest" />

import * as fs from 'node:fs';
import * as path from 'node:path';
import { Browser, launch, Page } from 'puppeteer';
import { Task } from '../src/models/Task';
import { Parser } from '../src/parsers/Parser';

const publicUrl = 'https://jungol.co.kr/problem/1000';
const exposeParsersScript = fs.readFileSync(path.resolve(__dirname, '../build-test/expose-parsers.js'), 'utf-8');

function metadata(problem: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    schemaVersion: 1,
    problem: {
      name: 'JUNGOL_1000. 두 정수 더하기',
      group: 'JUNGOL',
      url: publicUrl,
      interactive: false,
      timeLimit: 1500,
      memoryLimit: 128,
      tests: [{ input: '1 2\n', output: '3\n' }],
      testType: 'single',
      input: { type: 'stdin' },
      output: { type: 'stdout' },
      languages: { java: { mainClass: 'Main', taskClass: 'Jungol1000' } },
      ...problem,
    },
  };
}

function marker(data: unknown): string {
  return `<script id="competitive-companion" type="application/json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

let browser: Browser;
let page: Page;

beforeAll(async () => {
  browser = await launch({ headless: process.env.HEADLESS !== 'false' });
  page = await browser.newPage();
  await page.evaluate(exposeParsersScript);
});

afterAll(async () => {
  await browser?.close();
});

async function parse(data: unknown = metadata(), url: string = publicUrl): Promise<Task> {
  return parseHtml(marker(data), url);
}

async function parseHtml(html: string, url: string = publicUrl): Promise<Task> {
  return page.evaluate(
    async ({ html, url }) => {
      const parser: Parser = (window as any).JungolProblemParser;
      return (await parser.parse(url, html)) as Task;
    },
    { html, url },
  );
}

async function matches(url: string): Promise<boolean> {
  return page.evaluate(url => {
    const parser: Parser = (window as any).JungolProblemParser;
    return (
      parser.getRegularExpressions().some(expression => expression.test(url)) &&
      !parser.getExcludedRegularExpressions().some(expression => expression.test(url))
    );
  }, url);
}

test('exports the public contract and generates its own single-task batch', async () => {
  const result = await parse(
    metadata({
      batch: { id: 'page-controlled', size: 99 },
      token: 'unrelated-field',
      input: { type: 'stdin', fileName: 'unrelated.txt' },
      tests: [{ input: '1 2\n', output: '3\n', hidden: 'unrelated-field' }],
      languages: { java: { mainClass: 'Main', taskClass: 'Jungol1000', extra: true }, other: {} },
    }),
  );
  const expected = metadata().problem;
  expect(result).toEqual({
    ...(expected as object),
    batch: { id: expect.any(String), size: 1 },
  });
  expect(result.batch.id).not.toBe('page-controlled');
  expect((await parse()).batch.id).not.toBe(result.batch.id);
});

test('preserves sample whitespace, empty samples and literal markup', async () => {
  const result = await parse(
    metadata({
      tests: [
        { input: '', output: '' },
        { input: '  1\t2  \n\n', output: '\t3  ' },
        { input: '&nbsp;<br>\n</script> 한글', output: '\n' },
      ],
    }),
  );
  expect(result.tests).toEqual([
    { input: '', output: '' },
    { input: '  1\t2  \n\n', output: '\t3  \n' },
    { input: '&nbsp;<br>\n</script> 한글\n', output: '\n' },
  ]);
  expect((await parse(metadata({ tests: [] }))).tests).toEqual([]);
});

test('preserves an unspecified memory limit for JUNGOL problem 502', async () => {
  const url = 'https://jungol.co.kr/problem/502';
  const result = await parse(
    metadata({
      name: 'JUNGOL_502. 출력 – 자가진단2',
      url,
      timeLimit: 1000,
      memoryLimit: 0,
      tests: [{ input: '', output: "Programming! It's fun." }],
      languages: { java: { mainClass: 'Main', taskClass: 'Jungol502' } },
    }),
    url,
  );
  expect(result).toEqual({
    ...(metadata().problem as object),
    name: 'JUNGOL_502. 출력 – 자가진단2',
    url,
    timeLimit: 1000,
    memoryLimit: 0,
    tests: [{ input: '', output: "Programming! It's fun.\n" }],
    languages: { java: { mainClass: 'Main', taskClass: 'Jungol502' } },
    batch: { id: expect.any(String), size: 1 },
  });
});

test('compares only the origin and path, then removes navigation parameters', async () => {
  const result = await parse(
    metadata({ url: `${publicUrl}?source=bookmark#statement` }),
    `${publicUrl}?tab=1#examples`,
  );
  expect(result.url).toBe(publicUrl);
});

test.each([
  publicUrl,
  'http://www.jungol.co.kr/problem/1000',
  'https://contest.jungol.co.kr/problem/1',
  'https://jungol.co.kr/en/problem/1000/',
  'https://jungol.co.kr/absproxy/5173/ko/contest/summer_2026-A/problem/1',
  'https://jungol.co.kr/lecture/42/problem/1',
  'https://jungol.co.kr/online/42/problem/1',
  'https://jungol.co.kr/course/42/problem/1',
  'https://jungol.co.kr/ko/book/basics_1/1000',
])('matches and preserves a supported context: %s', async url => {
  const currentUrl = `${url}?navigation=1#examples`;
  expect(await matches(currentUrl)).toBe(true);
  expect((await parse(metadata({ url }), currentUrl)).url).toBe(url);
});

test.each([
  'https://jungol.co.kr/',
  'https://jungol.co.kr/problem/0',
  'https://jungol.co.kr/problem/-1',
  'https://jungol.co.kr/problem/name',
  'https://jungol.co.kr/problem/1000/solution',
  'https://jungol.co.kr/problem/1000/submit',
  'https://jungol.co.kr/contest/42',
  'https://jungol.co.kr/book/basics_1/1000/editor',
  'https://jungol.co.kr.evil.example/problem/1000',
  'https://other.example/problem/1000',
  'ftp://jungol.co.kr/problem/1000',
])('does not match or parse an unsupported page: %s', async url => {
  expect(await matches(url)).toBe(false);
  await expect(parse(metadata({ url }), url)).rejects.toThrow();
});

test.each([
  ['missing marker', '<h1>Problem</h1><pre>1 2</pre><pre>3</pre>'],
  ['duplicate marker', marker(metadata()) + marker(metadata())],
  ['wrong element', '<div id="competitive-companion" type="application/json">{}</div>'],
  ['wrong MIME type', '<script id="competitive-companion" type="text/plain">{}</script>'],
  [
    'external script',
    marker(metadata()).replace('type="application/json"', 'type="application/json" src="/data.json"'),
  ],
  ['invalid JSON', '<script id="competitive-companion" type="application/json">{</script>'],
])('rejects %s without a DOM fallback', async (_name, html) => {
  await expect(parseHtml(html)).rejects.toThrow();
});

test.each([
  ['null payload', null],
  ['array payload', []],
  ['missing version', { problem: metadata().problem }],
  ['unknown version', { ...metadata(), schemaVersion: 2 }],
  ['string version', { ...metadata(), schemaVersion: '1' }],
  ['missing problem', { schemaVersion: 1 }],
  ['array problem', { schemaVersion: 1, problem: [] }],
])('rejects %s', async (_name, data) => {
  await expect(parse(data)).rejects.toThrow();
});

test.each([
  ['missing name', { name: null }],
  ['empty name', { name: '   ' }],
  ['non-string group', { group: 1 }],
  ['empty group', { group: '' }],
  ['zero time limit', { timeLimit: 0 }],
  ['sub-unit time limit', { timeLimit: 0.5 }],
  ['negative memory limit', { memoryLimit: -1 }],
  ['sub-unit memory limit', { memoryLimit: 0.5 }],
  ['non-numeric limit', { memoryLimit: '128' }],
  ['null limit', { timeLimit: null }],
  ['missing tests', { tests: null }],
  ['non-array tests', { tests: {} }],
  ['null sample', { tests: [null] }],
  ['non-string sample', { tests: [{ input: 12, output: '3' }] }],
  ['missing sample output', { tests: [{ input: '1 2' }] }],
  ['interactive mode', { interactive: true }],
  ['missing interactive mode', { interactive: null }],
  ['multi-number tests', { testType: 'multiNumber' }],
  ['file input', { input: { type: 'file', fileName: 'input.txt' } }],
  ['file output', { output: { type: 'file', fileName: 'output.txt' } }],
  ['missing language hints', { languages: null }],
  ['wrong main class', { languages: { java: { mainClass: 'Solution', taskClass: 'Jungol1000' } } }],
  ['empty task class', { languages: { java: { mainClass: 'Main', taskClass: '' } } }],
  ['invalid task class', { languages: { java: { mainClass: 'Main', taskClass: '1000Task' } } }],
  ['non-ASCII task class', { languages: { java: { mainClass: 'Main', taskClass: '정올1000' } } }],
  ['conflicting task class', { languages: { java: { mainClass: 'Main', taskClass: 'Main' } } }],
])('rejects %s', async (_name, fields) => {
  await expect(parse(metadata(fields as Record<string, unknown>))).rejects.toThrow();
});

test.each([
  'https://jungol.co.kr/problem/1001',
  'https://jungol.co.kr/contest/42/problem/1000',
  'https://www.jungol.co.kr/problem/1000',
  'http://jungol.co.kr/problem/1000',
  'https://jungol.co.kr:444/problem/1000',
  'https://user:password@jungol.co.kr/problem/1000',
  '/problem/1000',
  'invalid URL',
])('rejects stale or invalid metadata URL: %s', async url => {
  await expect(parse(metadata({ url }))).rejects.toThrow();
});
