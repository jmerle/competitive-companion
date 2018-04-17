import { Parser } from '../Parser';
import { Test } from '../../models/Test';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class HackerRankProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.hackerrank.com/challenges/*/problem',
      'https://www.hackerrank.com/contests/*/challenges/*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('.challenge-view h2').textContent.trim());

      const breadCrumbs = [...elem.querySelectorAll('ol.bcrumb li a span')].map(el => el.textContent);
      task.setGroup(['HackerRank', ...breadCrumbs.slice(1, -1)].join(' - '));

      const blocks = elem.querySelectorAll('.challenge-body-html pre');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent.trim();
        const output = blocks[i + 1].textContent.trim();

        task.addTest(new Test(input, output));
      }

      task.setTimeLimit(4000);
      task.setMemoryLimit(512);

      resolve(task.build());
    });
  }
}
