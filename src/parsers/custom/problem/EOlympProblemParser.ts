import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { htmlToElement } from '../../../utils';

export class EOlympProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/problems/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('.eo-paper__header').textContent;

      const contestNameParts = ['E-Olymp', elem.querySelector('.eo-title__header').textContent];
      if (contestNameParts[1] === taskName) {
        contestNameParts.pop();
      }

      const contestName = contestNameParts.join(' - ');

      const memoryLimit = parseInt(elem.querySelectorAll('.eo-message__text b')[1].textContent);

      const tests: Test[] = [];

      const blocks = elem.querySelectorAll('.mdl-grid .eo-code');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent;
        const output = blocks[i + 1].textContent;

        tests.push(new Test(input, output));
      }

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
