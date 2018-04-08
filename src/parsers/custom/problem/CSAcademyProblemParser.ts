import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class CSAcademyProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://csacademy.com/*/task/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('h1').textContent;
      const contestName = 'CSAcademy';

      const memoryLimitStr = [...elem.querySelectorAll('em')]
        .find(el => el.textContent.includes('MB'))
        .textContent;
      const memoryLimit = parseInt(/(\d+) MB/.exec(memoryLimitStr)[1]);

      const tests: Test[] = [];

      elem.querySelectorAll('table tbody tr').forEach(tr => {
        const blocks = tr.querySelectorAll('pre');
        const input = blocks[0].textContent.trim();
        const output = blocks[1].textContent.trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
