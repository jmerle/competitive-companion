import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { htmlToElement } from '../../../utils';
import { CustomTask } from '../../../models/CustomTask';
import { Test } from '../../../models/Test';

export class DMOJProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://dmoj.ca/problem/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);

      const taskName = elem.querySelector('.problem-title').childNodes[1].textContent;
      const contestName = 'DMOJ';

      const tests: Test[] = [];

      const inputs = [...elem.querySelectorAll('h4')]
        .filter(el => el.textContent.includes('Sample Input'));
      const outputs = [...elem.querySelectorAll('h4')]
        .filter(el => el.textContent.includes('Sample Output'));

      for (let i = 0; i < inputs.length; i++) {
        let inputElem: Element = inputs[i];
        while (inputElem.tagName !== 'PRE') {
          inputElem = inputElem.nextElementSibling;
        }

        let outputElem: Element = outputs[i];
        while (outputElem.tagName !== 'PRE') {
          outputElem = outputElem.nextElementSibling;
        }

        const input = inputElem.textContent;
        const output = outputElem.textContent;

        tests.push(new Test(input, output));
      }

      const memoryLimitStr = [...elem.querySelectorAll('.problem-info-entry')]
        .find(el => el.textContent.includes('Memory limit:'))
        .textContent
        .split('\n')[2]
        .slice(0, -1);
      const memoryLimit = parseInt(memoryLimitStr);

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
