import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HihoCoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://hihocoder.com/problemset/problem/*',
      'https://hihocoder.com/contest/*/problem/*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const main = elem.querySelector('#main > .panel');

      task.setName(main.querySelector('h3').textContent.replace(':', '-'));

      if (elem.querySelector('.tl-site-header-title')) {
        const contest = elem
          .querySelector('.tl-site-header-title > h3')
          .childNodes[0].textContent.trim();

        task.setGroup(`hihoCoder - ${contest}`);
      } else {
        task.setGroup('hihoCoder');
      }

      const limits = main.querySelector('.limit').textContent;
      task.setTimeLimit(parseInt(/(\d+)ms/.exec(limits)[1], 10));
      task.setMemoryLimit(parseInt(/(\d+)MB/.exec(limits)[1], 10));

      const blocks = main.querySelectorAll('pre');

      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent;
        const output = blocks[i + 1].textContent;

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
