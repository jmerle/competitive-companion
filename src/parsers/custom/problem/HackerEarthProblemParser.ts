import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class HackerEarthProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.hackerearth.com/*/algorithm/*',
      'https://www.hackerearth.com/*/approximate/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('#problem-title').textContent.trim();

      let contestNameSuffix: string[] = [];

      if (elem.querySelector('.timings') !== null) {
        contestNameSuffix = [elem.querySelector('.cover .title').textContent.trim()];
      } else {
        contestNameSuffix = [...elem.querySelectorAll('.breadcrumb a')].map(el => el.textContent).slice(1);
      }

      const contestName = ['HackerEarth', ...contestNameSuffix].join(' - ');

      const tests: Test[] = [];

      elem.querySelectorAll('.input-output-container').forEach(container => {
        const blocks = container.querySelectorAll('pre');
        const input = blocks[0].textContent.trim();
        const output = blocks[1].textContent.trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, 256));
    });
  }
}
