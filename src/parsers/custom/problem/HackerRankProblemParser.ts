import { Parser } from '../../Parser';
import { CustomTask } from '../../../models/CustomTask';
import { Test } from '../../../models/Test';
import { Sendable } from '../../../models/Sendable';
import { htmlToElement } from '../../../utils';

export class HackerRankProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.hackerrank.com/challenges/*/problem',
      'https://www.hackerrank.com/contests/*/challenges/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('.challenge-view h2').textContent.trim();

      const breadCrumbs = [...elem.querySelectorAll('ol.bcrumb li a span')].map(el => el.textContent);
      const contestName = ['HackerRank', ...breadCrumbs.slice(1, -1)].join(' - ');

      const tests: Test[] = [];

      const blocks = elem.querySelectorAll('.challenge_sample_input pre, .challenge_sample_output pre');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent.trim();
        const output = blocks[i + 1].textContent.trim();

        tests.push(new Test(input, output));
      }

      resolve(new CustomTask(taskName, contestName, tests, 512));
    });
  }
}
