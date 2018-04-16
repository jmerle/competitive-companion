import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils';
import { Test } from '../../models/Test';
import { TaskBuilder } from '../../models/TaskBuilder';

export class DMOJProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://dmoj.ca/problem/*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('.problem-title').childNodes[1].textContent);
      task.setGroup('DMOJ');

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

        task.addTest(new Test(input, output));
      }

      const timeLimitStr = [...elem.querySelectorAll('.problem-info-entry')]
        .find(el => el.textContent.includes('Time limit:'))
        .textContent
        .split('\n')[2]
        .slice(0, -1);
      task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

      const memoryLimitStr = [...elem.querySelectorAll('.problem-info-entry')]
        .find(el => el.textContent.includes('Memory limit:'))
        .textContent
        .split('\n')[2]
        .slice(0, -1);
      task.setMemoryLimit(parseInt(memoryLimitStr));

      resolve(task.build());
    });
  }
}
