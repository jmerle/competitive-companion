import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { Parser } from '../Parser';

export class QOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://qoj.ac/problem/*', 'https://qoj.ac/contest/*/problem/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/qoj\.ac\/(?:contest\/\d+\/)?problem\/\d+(?:\/statement\/[^/?#]+)?\/?(?:[?#].*)?$/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('QOJ').setUrl(url);

    const title = elem.querySelector('h1.page-header, .page-header h1.text-center');
    task.setName(title.textContent.replace(/\s+/g, ' ').trim());

    const category = elem.querySelector('.page-header h1 small');
    if (category !== null) {
      task.setCategory(category.textContent.replace(/\s+/g, ' ').trim());
    }

    for (const badge of elem.querySelectorAll('.uoj-content > .row .badge')) {
      const time = /([\d.]+)\s*(ms|s)\s*$/i.exec(badge.textContent);
      if (time !== null) {
        task.setTimeLimit(parseFloat(time[1]) * (time[2].toLowerCase() === 's' ? 1000 : 1));
      }

      const memory = /([\d.]+)\s*([KMG])i?B\s*$/i.exec(badge.textContent);
      if (memory !== null) {
        const multiplier = { K: 1 / 1024, M: 1, G: 1024 }[memory[2].toUpperCase()];
        task.setMemoryLimit(parseFloat(memory[1]) * multiplier);
      }
    }

    const { statement, tests } = await this.getStatement(url, elem);
    task.tests = tests;
    task.setInteractive(
      [...statement.querySelectorAll('h1, h2, h3, h4, p')].some(el =>
        /^(?:interaction(?: protocol)?|sample interaction|交互(?:协议|協議|格式|过程|過程)?)$|^(?:this is an interactive (?:problem|task)\b|这是一道交互题|這是一道互動題)/i.test(
          el.textContent.trim(),
        ),
      ),
    );

    return task.build();
  }

  private async getStatement(url: string, elem: Element): Promise<{ statement: Element; tests: Test[] }> {
    let fallback: { statement: Element; tests: Test[] } = null;
    const currentStatement = elem.querySelector('#tab-statement article');
    if (currentStatement?.textContent.trim()) {
      fallback = { statement: currentStatement, tests: this.parseTests(currentStatement) };
      if (fallback.tests.length > 0) {
        return fallback;
      }
    }

    const currentUrl = new URL(url);
    currentUrl.hash = '';
    currentUrl.pathname = currentUrl.pathname.replace(/\/$/, '');
    const problemPath = /^\/(?:contest\/\d+\/)?problem\/\d+(?=\/|$)/.exec(currentUrl.pathname)[0];

    const candidates: URL[] = [];
    for (const language of ['en', 'zh_cn']) {
      const pathname = `${problemPath}/statement/${language}`;
      let candidate = new URL(pathname, currentUrl);

      for (const link of elem.querySelectorAll('.nav-tabs a[href*="/statement/"]')) {
        let advertisedUrl: URL;
        try {
          advertisedUrl = new URL(link.getAttribute('href'), currentUrl);
        } catch {
          continue;
        }
        if (advertisedUrl.origin === currentUrl.origin && advertisedUrl.pathname.replace(/\/$/, '') === pathname) {
          candidate = advertisedUrl;
          break;
        }
      }

      for (const key of currentUrl.searchParams.keys()) {
        candidate.searchParams.delete(key);
      }
      for (const [key, value] of currentUrl.searchParams) {
        candidate.searchParams.append(key, value);
      }
      candidate.hash = '';
      candidate.pathname = candidate.pathname.replace(/\/$/, '');
      candidates.push(candidate);
    }

    const currentKey = new URL(currentUrl.href);
    currentKey.searchParams.sort();
    const visited = new Set<string>([currentKey.href]);
    for (const candidate of candidates) {
      const key = new URL(candidate.href);
      key.searchParams.sort();
      if (visited.has(key.href)) {
        continue;
      }
      visited.add(key.href);

      let page: Element;
      try {
        // Missing translations are normal; try each language once before moving on.
        page = htmlToElement(await request(candidate.href, {}, 0));
      } catch {
        continue;
      }

      const statement = page.querySelector('#tab-statement article');
      if (!statement?.textContent.trim()) {
        continue;
      }

      const result = { statement, tests: this.parseTests(statement) };
      if (result.tests.length > 0) {
        return result;
      }
      fallback ??= result;
    }

    if (fallback !== null) {
      return fallback;
    }
    throw new Error('No supported QOJ HTML statement was found. PDF-only statements cannot be parsed.');
  }

  private parseTests(statement: Element): Test[] {
    const tests: Test[] = [];
    let input: { text: string; index: number | null } = null;
    for (const block of statement.querySelectorAll('pre:not(.sh_sourceCode)')) {
      const table = block.closest('table');
      if (table !== null) {
        const row = block.closest('tr');
        if (row === null) {
          continue;
        }
        const blocks = [...row.querySelectorAll('td pre:not(.sh_sourceCode)')].filter(pre => pre.closest('tr') === row);
        if (block === blocks[0] && blocks.length === 2 && this.isSampleTable(table, statement)) {
          tests.push(new Test(this.getSampleText(blocks[0]), this.getSampleText(blocks[1]), false));
        }
        continue;
      }

      const heading = block.previousElementSibling;
      if (heading === null || !/^(?:H[1-6]|P|STRONG|B)$/.test(heading.tagName)) {
        continue;
      }

      const label = this.getSampleLabel(heading.textContent);
      if (label?.type === 'input') {
        input = { text: this.getSampleText(block), index: label.index };
      } else if (label?.type === 'output') {
        if (input !== null && (input.index === null || label.index === null || input.index === label.index)) {
          tests.push(new Test(input.text, this.getSampleText(block), false));
        }
        input = null;
      }
    }
    return tests;
  }

  private isSampleTable(table: Element, statement: Element): boolean {
    for (const row of table.querySelectorAll('tr')) {
      if (row.closest('table') !== table) {
        continue;
      }
      const cells = [...row.children];
      if (
        cells.length === 2 &&
        cells.every(cell => cell.querySelector('pre') === null) &&
        this.getSampleLabel(cells[0].textContent)?.type === 'input' &&
        this.getSampleLabel(cells[1].textContent)?.type === 'output'
      ) {
        return true;
      }
    }

    const heading = [...statement.querySelectorAll('h1, h2, h3, h4, h5, h6')]
      .filter(el => table.compareDocumentPosition(el) & Node.DOCUMENT_POSITION_PRECEDING)
      .at(-1);
    return (
      heading !== undefined &&
      /^(?:samples?|examples?|样例|樣例)\s*#?\s*\d*\s*[:：]?$/i.test(heading.textContent.trim())
    );
  }

  private getSampleLabel(text: string): { type: 'input' | 'output'; index: number | null } | null {
    const normalized = text
      .toLowerCase()
      .replace(/sample|example|样例|樣例/g, '')
      .replace(/[\s\d#:：]/g, '');
    const index = /\d+/.exec(text);
    if (['input', '输入', '輸入'].includes(normalized)) {
      return { type: 'input', index: index === null ? null : Number(index[0]) };
    }
    if (['output', '输出', '輸出'].includes(normalized)) {
      return { type: 'output', index: index === null ? null : Number(index[0]) };
    }
    return null;
  }

  private getSampleText(block: Element): string {
    const copy = block.cloneNode(true) as Element;
    for (const br of copy.querySelectorAll('br')) {
      br.replaceWith('\n');
    }
    // Normalize whitespace without treating literal sample text as HTML a second time.
    return copy.textContent
      .split('\n')
      .map(line => line.trimEnd())
      .join('\n')
      .trimEnd();
  }
}
