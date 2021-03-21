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
    const task = new TaskBuilder('CodeChef').setUrl(url);

    const name = [...elem.querySelectorAll('h1')].pop().textContent.trim().split('\n')[0];

    task.setName(name);
    task.setCategory([...elem.querySelectorAll('.breadcrumbs a')].pop().textContent);
    task.setInteractive(html.includes('This is an interactive problem'));

    this.parseTests(html, task);

    const timeLimitStr = elem.querySelector('.problem-info').textContent;
    task.setTimeLimit(Math.floor(parseFloat(/([0-9.]+) secs/.exec(timeLimitStr)[1]) * 1000));

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
          task.addTest(codeBlocks[0].textContent, codeBlocks[1].textContent);
        } else if (textNodes.length >= 2) {
          const input = textNodes[textNodes.length - 2].textContent.trim();
          const output = textNodes[textNodes.length - 1].textContent.trim();
          task.addTest(input, output);
        }
      }
    });

    if (task.tests.length > 0) {
      return;
    }

    elem.querySelectorAll('div.mathjax-support').forEach(div => {
      const text = div.textContent.toLowerCase();
      if (!text.includes('ample input') || !text.includes('ample output')) {
        return;
      }

      const preBlocks = [...div.querySelectorAll('pre')];

      if (preBlocks.length === 2) {
        task.addTest(preBlocks[0].textContent, preBlocks[1].textContent);
      }
    });

    if (task.tests.length > 0) {
      return;
    }

    if (task.tests.length === 0) {
      const inputHeaders = [...elem.querySelectorAll('h3')].filter(x =>
        x.textContent.toLowerCase().includes('ample input'),
      );

      const outputHeaders = [...elem.querySelectorAll('h3')].filter(x =>
        x.textContent.toLowerCase().includes('ample output'),
      );

      for (let i = 0; i < inputHeaders.length && i < outputHeaders.length; i++) {
        task.addTest(inputHeaders[i].nextElementSibling.textContent, outputHeaders[i].nextElementSibling.textContent);
      }
    }
  }
}
