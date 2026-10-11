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

    const blocks: string[] = [];
    const statement = elem.querySelector('.card-body.typo.richmedia');

    if (statement !== null) {
      for (const heading of statement.children) {
        if (!/^H[1-6]$/.test(heading.tagName)) {
          continue;
        }

        const headingText = heading.textContent;
        const isInput = /样例\s*输入|输入样例|sample\s*input/i.test(headingText);
        const isOutput = /样例\s*输出|输出样例|sample\s*output/i.test(headingText);
        if (!isInput && !isOutput) {
          continue;
        }

        const container = heading.nextElementSibling;
        if (container === null) {
          continue;
        }

        let code: Element = null;
        if (container.matches('.code-toolbar')) {
          // After the page's JavaScript runs, code blocks are wrapped in a toolbar container
          code = container.querySelector('pre > code');
        } else if (container.matches('pre')) {
          // In the raw HTML (e.g. when fetched by the contest parser), the pre follows the heading directly
          code = container.querySelector('code');
        }

        if (code !== null) {
          blocks.push(code.textContent);
        }
      }
    }

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i], blocks[i + 1]);
    }

    return task.build();
  }
}
