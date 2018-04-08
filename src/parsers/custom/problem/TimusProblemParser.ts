import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class TimusProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://acm.timus.ru/problem.aspx*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('.problem_title').textContent;

      const limits = elem.querySelector('.problem_limits').textContent.trim();
      const memoryLimit = parseInt(/(\d+) (.){2}$/.exec(limits)[1]);

      const source = elem.querySelector('.problem_source').textContent;

      let contestName = 'Timus';

      if (/Problem Source: (.*)$/.test(source)) {
        contestName += ' - ' + /Problem Source: (.*)$/.exec(source)[1];
      }

      const tests: Test[] = [];

      [...elem.querySelectorAll('.sample tbody tr')].slice(1).forEach(tr => {
        const columns = tr.querySelectorAll('td');
        const input = columns[0].textContent.trim();
        const output = columns[1].textContent.trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
