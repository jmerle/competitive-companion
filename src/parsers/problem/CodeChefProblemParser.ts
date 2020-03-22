import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeChefProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.codechef.com/problems/*', 'https://www.codechef.com/*/problems/*'];
  }

  public getExcludedMatchPatterns(): string[] {
    return [
      'https://www.codechef.com/problems/school',
      'https://www.codechef.com/problems/easy',
      'https://www.codechef.com/problems/medium',
      'https://www.codechef.com/problems/hard',
      'https://www.codechef.com/problems/challenge',
      'https://www.codechef.com/problems/extcontest',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    const name = [...elem.querySelectorAll('h1')].pop().textContent.trim().split('\n')[0];

    task.setName(name);
    task.setGroup('CodeChef - ' + [...elem.querySelectorAll('.breadcrumbs a')].pop().textContent);
    task.setInteractive(html.includes('This is an interactive problem'));

    this.parseTests(html, task);

    task.setTimeLimit(parseFloat(/([0-9.]+) secs/.exec(elem.querySelector('.problem-info').textContent)[1]) * 1000);
    task.setMemoryLimit(256);

    return task.build();
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    elem.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('b') !== null) {
        const textNodes = [...pre.childNodes].filter(x => x.nodeType === Node.TEXT_NODE);
        const codeBlocks: HTMLElement[] = [...pre.querySelectorAll('code')];

        if (codeBlocks.length >= 2) {
          const input = codeBlocks[0].textContent.trim();
          const output = codeBlocks[1].textContent.trim();

          task.addTest(input, output);
        } else if (textNodes.length >= 2) {
          const input = textNodes[textNodes.length - 2].textContent.trim();
          const output = textNodes[textNodes.length - 1].textContent.trim();

          task.addTest(input, output);
        }
      }
    });

    if (task.tests.length === 0) {
      const inputHeaders = [...elem.querySelectorAll('h3')].filter(x =>
        x.textContent.toLowerCase().includes('ample input'),
      );

      const outputHeaders = [...elem.querySelectorAll('h3')].filter(x =>
        x.textContent.toLowerCase().includes('ample output'),
      );

      for (let i = 0; i < inputHeaders.length && i < outputHeaders.length; i++) {
        const input = inputHeaders[i].nextElementSibling.textContent;
        const output = outputHeaders[i].nextElementSibling.textContent;

        task.addTest(input, output);
      }
    }
  }
}
