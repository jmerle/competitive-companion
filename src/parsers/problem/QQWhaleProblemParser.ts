import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class QQWhaleProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://qqwhale.com/problem/*', 'https://www.qqwhale.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('QQWhale').setUrl(url);

    await task.setName(elem.querySelector('.home-title').textContent);

    const limitsStr = elem.querySelector('.problem-content > .content-desc').textContent;
    task.setTimeLimit(parseInt(/Time Limit：\s*(\d+)MS/.exec(limitsStr)[1]));
    task.setMemoryLimit(parseInt(/Memory Limit：\s*(\d+)MB/.exec(limitsStr)[1]));

    elem.querySelectorAll('.example').forEach(exampleElem => {
      const inputElem = exampleElem.querySelector('.example-input > pre');
      const outputElem = exampleElem.querySelector('.example-output > pre');

      if (inputElem !== null && outputElem !== null) {
        task.addTest(inputElem.textContent, outputElem.textContent);
      }
    });

    return task.build();
  }
}
