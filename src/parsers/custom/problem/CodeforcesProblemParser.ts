import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class CodeforcesProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*/problem/*',
      'http://codeforces.com/problemset/problem/*/*',
      'http://codeforces.com/gym/*/problem/*',
      'http://codeforces.com/group/*/contest/*/problem/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      let taskName = elem.querySelector('.problem-statement > .header > .title').textContent;
      taskName = taskName.replace('.', ' -');
      taskName = 'Problem ' + taskName;

      const contestName = elem.querySelector('.rtable > tbody > tr > th').textContent;

      const memoryLimitStr = elem
        .querySelector('.problem-statement > .header > .memory-limit')
        .childNodes[1]
        .textContent
        .split(' ')[0];
      const memoryLimit = parseInt(memoryLimitStr);

      const tests: Test[] = [];

      const inputs = document.querySelectorAll('.input pre');
      const outputs = document.querySelectorAll('.output pre');

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i].innerHTML;
        const output = outputs[i].innerHTML;

        tests.push(new Test(input, output));
      }

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
