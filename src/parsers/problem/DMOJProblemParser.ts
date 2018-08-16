import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class DMOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://dmoj.ca/problem/*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(
        elem.querySelector('.problem-title').childNodes[1].textContent,
      );
      task.setGroup('DMOJ');

      const inputs = [...elem.querySelectorAll('h4')].filter(el => {
        const text = el.textContent.toLowerCase();

        if (text.includes('output') || text.includes('explanation')) {
          return false;
        }

        return text.includes('sample input');
      });

      const outputs = [...elem.querySelectorAll('h4')].filter(el => {
        const text = el.textContent.toLowerCase();

        if (text.includes('explanation')) {
          return false;
        }

        return (
          text.includes('sample output') ||
          text.includes('output for sample input')
        );
      });

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

        task.addTest(input, output);
      }

      const timeLimitStr = [...elem.querySelectorAll('.problem-info-entry')]
        .find(el => el.textContent.includes('Time limit:'))
        .textContent.split('\n')[2]
        .slice(0, -1);
      task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

      const memoryLimitStr = [...elem.querySelectorAll('.problem-info-entry')]
        .find(el => el.textContent.includes('Memory limit:'))
        .textContent.split('\n')[2]
        .slice(0, -1);
      task.setMemoryLimit(parseInt(memoryLimitStr, 10));

      resolve(task.build());
    });
  }
}
