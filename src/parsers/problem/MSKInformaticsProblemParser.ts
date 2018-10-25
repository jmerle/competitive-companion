import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MSKInformaticsProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://informatics.msk.ru/mod/statements/view*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const title = elem.querySelector('.statements_toc_alpha strong');
      const text = title.textContent;
      const regex = / ([A-Z])\. /;
      const name = regex.exec(text)
        ? regex.exec(text)[1] + '. ' + text.split('. ')[1]
        : text;

      task.setName(name);
      task.setGroup('MSK Informatics');

      const limitsTable = elem.querySelector('.statements_content > table');

      const timeLimitStr = limitsTable.querySelector(
        'tbody > tr:first-child > td:last-child',
      ).textContent;

      const memoryLimitStr = limitsTable.querySelector(
        'tbody > tr:last-child > td:last-child',
      ).textContent;

      task.setTimeLimit(parseInt(timeLimitStr, 10) * 1000);
      task.setMemoryLimit(parseInt(memoryLimitStr, 10));

      elem.querySelectorAll('.sample-test').forEach(testElem => {
        const input = testElem.querySelector('.input > .content').textContent;
        const output = testElem.querySelector('.output > .content').textContent;

        task.addTest(input.trim(), output.trim());
      });

      resolve(task.build());
    });
  }
}
