import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
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

    let statement = elem.querySelector('#tab-statement article');
    if (statement === null && elem.querySelector('#tab-statement iframe') !== null) {
      // QOJ exposes HTML translations alongside many of its original PDF statements.
      const translation = [...elem.querySelectorAll('.nav-tabs a[href]')].find(link =>
        new URL(link.getAttribute('href'), url).pathname.endsWith('/statement/en'),
      );
      if (translation !== undefined) {
        const translationUrl = new URL(translation.getAttribute('href'), url);
        const version = new URL(url).searchParams.get('v');
        if (version !== null && !translationUrl.searchParams.has('v')) {
          translationUrl.searchParams.set('v', version);
        }
        const translatedPage = htmlToElement(await request(translationUrl.href));
        statement = translatedPage.querySelector('#tab-statement article');
      }

      if (statement === null) {
        throw new Error('Cannot parse this QOJ PDF statement. Open an English or Chinese HTML statement to parse it.');
      }
    }

    if (statement !== null) {
      task.setInteractive(
        [...statement.querySelectorAll('h1, h2, h3, h4, p')].some(el =>
          /^(?:interaction(?: protocol)?|sample interaction|交互(?:协议|協議|格式|过程|過程)?)$|^(?:this is an interactive (?:problem|task)\b|这是一道交互题|這是一道互動題)/i.test(
            el.textContent.trim(),
          ),
        ),
      );
      this.parseTests(statement, task);
    }

    return task.build();
  }

  private parseTests(statement: Element, task: TaskBuilder): void {
    for (const row of statement.querySelectorAll('table tr')) {
      const blocks = row.querySelectorAll('td pre');
      if (blocks.length === 2) {
        task.addTest(blocks[0].textContent, blocks[1].textContent);
      }
    }

    let input: string = null;
    for (const block of statement.querySelectorAll('pre:not(.sh_sourceCode)')) {
      if (block.closest('table') !== null) {
        continue;
      }

      const heading = block.previousElementSibling;
      if (heading === null || !/^H[1-6]$/.test(heading.tagName)) {
        continue;
      }

      const text = heading.textContent
        .toLowerCase()
        .replace(/sample|example|样例|樣例/g, '')
        .replace(/[\s\d#:：]/g, '');
      if (['input', '输入', '輸入'].includes(text)) {
        input = block.textContent;
      } else if (['output', '输出', '輸出'].includes(text)) {
        if (input !== null) {
          task.addTest(input, block.textContent);
          input = null;
        }
      }
    }
  }
}
