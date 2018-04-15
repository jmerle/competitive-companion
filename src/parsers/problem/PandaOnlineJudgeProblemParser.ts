import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

export class PandaOnlineJudgeProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://pandaoj.com/problem/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder();

      task.setName(elem.querySelector('panda-problem-description > h2').textContent.split(' - ')[1]);
      task.setGroup('Panda Online Judge');

      const blocks = elem.querySelectorAll('panda-testcase-sample pre');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent.trim();
        const output = blocks[i + 1].textContent.trim();

        task.addTest(new Test(input, output));
      }

      const headers = elem.querySelectorAll('panda-problem-description > h4');
      task.setTimeLimit(parseInt(/Time Limit: (\d+) ms/.exec(headers[1].textContent)[1]));
      task.setMemoryLimit(parseInt(/Memory Limit: (\d+) MB/.exec(headers[0].textContent)[1]));

      resolve(task.build());
    });
  }
}
