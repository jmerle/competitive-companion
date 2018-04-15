import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

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
      const task = new TaskBuilder();

      task.setName([...elem.querySelectorAll('h1')].pop().textContent.trim().split('\n')[0]);
      task.setGroup('CodeChef - ' + [...elem.querySelectorAll('.breadcrumbs a')].pop().textContent);

      elem.querySelectorAll('pre').forEach(pre => {
        if (pre.querySelector('b') !== null) {
          const input = pre.childNodes[1].textContent.trim();
          const output = pre.childNodes[3].textContent.trim();

          task.addTest(new Test(input, output));
        }
      });

      task.setTimeLimit(parseFloat(/([0-9.]+) secs/.exec(elem.querySelector('.problem-info').textContent)[1]) * 1000);
      task.setMemoryLimit(256);

      resolve(task.build());
    });
  }
}
