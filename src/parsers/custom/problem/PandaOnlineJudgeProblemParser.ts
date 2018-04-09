import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { CustomTask } from '../../../models/CustomTask';
import { Test } from '../../../models/Test';
import { htmlToElement } from '../../../utils';

export class PandaOnlineJudgeProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://pandaoj.com/problem/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('panda-problem-description > h2').textContent.split(' - ')[1];
      const contestName = 'Panda Online Judge';

      const tests: Test[] = [];

      const blocks = elem.querySelectorAll('panda-testcase-sample pre');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent.trim();
        const output = blocks[i + 1].textContent.trim();

        tests.push(new Test(input, output));
      }

      const memoryLimitStr = elem.querySelector('panda-problem-description > h4').textContent;
      const memoryLimit = parseInt(/Memory Limit: (\d+) MB/.exec(memoryLimitStr)[1]);

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
