import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Contest } from '../../models/Contest';
import { Task } from '../../models/Task';
import { Test } from '../../models/Test';
import { TestType } from '../../models/TestType';

export class OldGoogleCodeJamContestParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://code.google.com/codejam/contest/*/dashboard*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const tasks: Task[] = [];

      const group = document.querySelector('#dsb-contest-title').textContent;

      const problemCount = document.querySelectorAll('#dsb-problem-pages > div').length;
      for (let i = 0; i < problemCount; i++) {
        const task = new TaskBuilder();

        task.setName(document.querySelector('#dsb-problem-title' + i).textContent.trim());
        task.setGroup(group);

        const blocks = elem.querySelectorAll(`#dsb-problem-page${i} .problem-io-wrapper pre.io-content`);
        const input = blocks[0].textContent.trim();
        const output = blocks[1].textContent.trim();
        task.addTest(new Test(input, output));

        task.setInput({
          type: 'regex',
          pattern: task.name[0] + '-(small|large).*[.]in',
        });

        task.setOutput({
          type: 'file',
          fileName: task.name[0].toLowerCase() + '.out',
        });

        task.setTestType(TestType.MultiNumber);

        task.setTimeLimit(180000);
        task.setMemoryLimit(512);

        tasks.push(task.build());
      }

      resolve(new Contest(tasks));
    });
  }
}
