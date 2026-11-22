import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeSourceProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns = [];

    for (const path of ['p/*', 'd/*/p/*', 'contest/*/p/*']) {
      patterns.push(`https://newoj.daimayuan.top/${path}`);
    }

    return patterns;
  }

  public canHandlePage(): boolean {
    return document.querySelector('h1.card-title') !== null;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Daimayuan Online Judge').setUrl(url);

    const pageTitle = elem.querySelector('h2.page-title');
    const title = pageTitle
      ? [...pageTitle.childNodes]
          .filter(node => node.nodeType === Node.TEXT_NODE)
          .map(node => node.textContent)
          .join('')
          .trim()
      : '';

    const cardTitle = elem.querySelector('h1.card-title').textContent.trim();

    let name = title || cardTitle;
    if (title !== '' && cardTitle !== '') {
      // On contest pages the title is prefixed with the contest name (e.g. "contest name #A. problem name"),
      // cut everything before the problem identifier
      const nameIndex = title.lastIndexOf(cardTitle);
      const prefix = title.substring(0, nameIndex > 0 ? nameIndex : title.length);
      const hashIndex = prefix.lastIndexOf('#');
      if (hashIndex >= 0) {
        name = title.substring(hashIndex);
      }
    }

    task.setName(name.replace(/^#\s*/, ''));

    const tags = [...elem.querySelectorAll('ul.problem__tags .problem__tag-item')];

    const timeLimitTag = tags.find(tag => /(\d+)\s*ms/.test(tag.textContent));
    if (timeLimitTag !== undefined) {
      task.setTimeLimit(parseInt(/(\d+)\s*ms/.exec(timeLimitTag.textContent)[1], 10));
    }

    const memoryLimitTag = tags.find(tag => /(\d+)\s*MiB/.test(tag.textContent));
    if (memoryLimitTag !== undefined) {
      task.setMemoryLimit(parseInt(/(\d+)\s*MiB/.exec(memoryLimitTag.textContent)[1], 10));
    }

    const fileIOTag = tags.find(tag => /文件IO/.test(tag.textContent));
    if (fileIOTag !== undefined) {
      const match = /文件IO\s*[:：]\s*(\S+)/.exec(fileIOTag.textContent);
      if (match !== null) {
        task.setInput({ type: 'file', fileName: `${match[1]}.in` });
        task.setOutput({ type: 'file', fileName: `${match[1]}.out` });
      }
    }

    const statement = elem.querySelector('.card-body.typo.richmedia');
    const blocks = statement === null ? [] : CodeSourceProblemParser.getSamples(statement);

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i], blocks[i + 1]);
    }

    return task.build();
  }

  private static getSamples(statement: Element): string[] {
    // Newer problems use language-inputN / language-outputN classes on the
    // sample code blocks themselves. This works both in the live DOM (where
    // blocks are wrapped in .code-toolbar) and in raw HTML fetched by the
    // contest parser (where the pre follows the heading directly).
    const byClass: string[] = [];

    for (const code of statement.querySelectorAll('pre > code')) {
      if (/language-input\d*/i.test(code.className) || /language-output\d*/i.test(code.className)) {
        byClass.push(code.textContent);
      }
    }

    if (byClass.length > 1) {
      return byClass;
    }

    // Other problems use headings such as "输入 1" / "输出 1", "输入数据 1",
    // "样例输入", or "Sample Input", with plain code blocks. Some of those
    // headings are nested inside the code toolbar added by the page's scripts.
    const byHeading: string[] = [];

    for (const heading of statement.querySelectorAll('h1, h2, h3, h4, h5, h6')) {
      const headingText = heading.textContent.trim();
      const isInput =
        /样例\s*输入|输入\s*样例|sample\s*input/i.test(headingText) ||
        /^输入(\s*数据)?\s*[#＃]?\s*\d*\s*$/.test(headingText) ||
        /^input(\s*data)?\s*#?\s*\d*\s*$/i.test(headingText);
      const isOutput =
        /样例\s*输出|输出\s*样例|sample\s*output/i.test(headingText) ||
        /^输出(\s*数据)?\s*[#＃]?\s*\d*\s*$/.test(headingText) ||
        /^output(\s*data)?\s*#?\s*\d*\s*$/i.test(headingText);

      if (!isInput && !isOutput) {
        continue;
      }

      const code = CodeSourceProblemParser.getCodeForHeading(heading);
      if (code !== null) {
        byHeading.push(code.textContent);
      }
    }

    return byHeading;
  }

  private static getCodeForHeading(heading: Element): Element | null {
    const parent = heading.parentElement;
    let container: Element | null;

    if (parent !== null && /code-toolbar|syntax-hl|sample/i.test(parent.className)) {
      // The heading itself was moved inside the code toolbar by the page scripts
      container = parent;
    } else {
      container = heading.nextElementSibling;
      while (
        container !== null &&
        container.matches('pre') === false &&
        container.querySelector('pre > code') === null
      ) {
        container = container.nextElementSibling;
      }
    }

    if (container === null) {
      return null;
    }

    return container.matches('pre') ? container.querySelector('code') : container.querySelector('pre > code');
  }
}
