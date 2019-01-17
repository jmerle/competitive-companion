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

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(
        [...elem.querySelectorAll('h1')]
          .pop()
          .textContent.trim()
          .split('\n')[0],
      );

      task.setGroup('CodeChef - ' + [...elem.querySelectorAll('.breadcrumbs a')].pop().textContent);
      task.setInteractive(html.includes('This is an interactive problem'));

      this.parseTests(html, task);

      task.setTimeLimit(parseFloat(/([0-9.]+) secs/.exec(elem.querySelector('.problem-info').textContent)[1]) * 1000);
      task.setMemoryLimit(256);

      resolve(task.build());
    });
  }

  public parseTests(html: string, task: TaskBuilder) {
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
      const inputHeader = [...elem.querySelectorAll('h3')].find(x =>
        x.textContent.toLowerCase().includes('ample input'),
      );

      const outputHeader = [...elem.querySelectorAll('h3')].find(x =>
        x.textContent.toLowerCase().includes('ample output'),
      );

      if (inputHeader !== undefined && outputHeader !== undefined) {
        const input = inputHeader.nextElementSibling.textContent;
        const output = outputHeader.nextElementSibling.textContent;

        task.addTest(input, output);
      }
    }
  }
}
