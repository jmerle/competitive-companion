import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { UsacoTask } from '../../../models/UsacoTask';
import { Test } from '../../../models/Test';
import { htmlToElement } from '../../../utils';

export class UsacoTrainingProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://train.usaco.org/usacoprob2*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskId = [...elem.querySelectorAll('h3')]
        .find(el => el.textContent.includes('PROGRAM NAME'))
        .textContent
        .substr(14);

      const taskName = elem.querySelector('center > h1').textContent;
      const contestName = 'USACO Training';

      const input = [...elem.querySelectorAll('h3')]
        .find(el => el.textContent.includes('SAMPLE INPUT'))
        .nextElementSibling
        .textContent;

      const output = [...elem.querySelectorAll('h3')]
        .find(el => el.textContent.includes('SAMPLE OUTPUT'))
        .nextElementSibling
        .textContent;

      const test = new Test(input, output);

      resolve(new UsacoTask(taskId, taskName, contestName, test));
    });
  }
}
