import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class CodeChefProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.codechef.com/problems/*',
      'https://www.codechef.com/*/problems/*',
    ];
  }

  getExcludedMatchPatterns(): string[] {
    return [
      'https://www.codechef.com/problems/school',
      'https://www.codechef.com/problems/easy',
      'https://www.codechef.com/problems/medium',
      'https://www.codechef.com/problems/hard',
      'https://www.codechef.com/problems/challenge',
      'https://www.codechef.com/problems/extcontest',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = [...elem.querySelectorAll('h1')].pop().textContent.trim().split('\n')[0];
      const contestName = 'CodeChef - ' + [...elem.querySelectorAll('.breadcrumbs a')].pop().textContent;

      const tests = this.parseTests(html);

      resolve(new CustomTask(taskName, contestName, tests, 256));
    });
  }

  parseTests(html: string): Test[] {
    const tests: Test[] = [];
    const elem = htmlToElement(html);

    elem.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('b') !== null) {
        const input = pre.childNodes[1].textContent.trim();
        const output = pre.childNodes[3].textContent.trim();

        tests.push(new Test(input, output));
      }
    });

    if (tests.length === 0) {
      const inputHeader = [...elem.querySelectorAll('h3')]
        .find(x => x.textContent.toLowerCase().includes('example input'));
      const outputHeader = [...elem.querySelectorAll('h3')]
        .find(x => x.textContent.toLowerCase().includes('example output'));

      if (inputHeader !== null && outputHeader !== null) {
        const input = inputHeader.nextElementSibling.textContent;
        const output = outputHeader.nextElementSibling.textContent;

        tests.push(new Test(input, output));
      }
    }

    return tests;
  }
}
