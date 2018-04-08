import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { htmlToElement } from '../../../utils';
import { CustomTask } from '../../../models/CustomTask';
import { Test } from '../../../models/Test';

export class LightOJProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://www.lightoj.com/volume_showproblem.php*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('#problem_name').textContent.trim();
      const contestName = 'LightOJ';

      const columns = elem.querySelectorAll('.MsoTableGrid > tbody > tr > td');
      const input = [...columns[2].querySelectorAll('span')].map(el => el.textContent.replace(/\n /g, '')).join('\n');
      const output = [...columns[3].querySelectorAll('span')].map(el => el.textContent.replace(/\n /g, '')).join('\n');

      const tests = [new Test(input, output)];

      const memoryLimitStr = elem.querySelector('#mytable > tbody > tr > td:nth-child(2).two').textContent.trim();
      const memoryLimit = parseInt(/Memory Limit: (\d+) MB/.exec(memoryLimitStr)[1]);

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
