import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class CodeforcesProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*/problem/*',
      'http://codeforces.com/problemset/problem/*/*',
      'http://codeforces.com/gym/*/problem/*',
      'http://codeforces.com/group/*/contest/*/problem/*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      let name = elem.querySelector('.problem-statement > .header > .title').textContent;
      name = name.replace('.', ' -');
      name = 'Problem ' + name;
      task.setName(name);

      task.setGroup(elem.querySelector('.rtable > tbody > tr > th').textContent);

      const timeLimitStr = elem
        .querySelector('.problem-statement > .header > .time-limit')
        .childNodes[1]
        .textContent
        .split(' ')[0];
      task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

      const memoryLimitStr = elem
        .querySelector('.problem-statement > .header > .memory-limit')
        .childNodes[1]
        .textContent
        .split(' ')[0];
      task.setMemoryLimit(parseInt(memoryLimitStr));

      const inputs = elem.querySelectorAll('.input pre');
      const outputs = elem.querySelectorAll('.output pre');

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i].innerHTML;
        const output = outputs[i].innerHTML;

        task.addTest(new Test(input, output));
      }

      resolve(task.build());
    });
  }
}
