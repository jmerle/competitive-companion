import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

export class TimusProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://acm.timus.ru/problem.aspx*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder();

      task.setName(elem.querySelector('.problem_title').textContent);

      const limits = elem.querySelector('.problem_limits').textContent.trim();
      task.setTimeLimit(parseFloat(/([0-9.]+ second)/.exec(limits)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limits)[1]));

      const source = elem.querySelector('.problem_source').textContent;

      let group = 'Timus';
      if (/Problem Source: (.*)$/.test(source)) {
        group += ' - ' + /Problem Source: (.*)$/.exec(source)[1];
      }

      task.setGroup(group);

      [...elem.querySelectorAll('.sample tbody tr')].slice(1).forEach(tr => {
        const columns = tr.querySelectorAll('td');
        const input = columns[0].textContent.trim();
        const output = columns[1].textContent.trim();

        task.addTest(new Test(input, output));
      });

      resolve(task.build());
    });
  }
}
