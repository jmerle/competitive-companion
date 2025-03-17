import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MSKInformaticsProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://informatics.msk.ru/mod/statements/view*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('MSK Informatics').setUrl(url);

    const title = elem.querySelector('.statements_toc_alpha strong');
    const text = title.textContent;
    const regex = / ([A-Z])\. /;
    await task.setName(regex.exec(text) ? regex.exec(text)[1] + '. ' + text.split('. ')[1] : text);

    elem.querySelectorAll('.sample-test').forEach(testElem => {
      const input = testElem.querySelector('.input > .content').textContent;
      const output = testElem.querySelector('.output > .content').textContent;

      task.addTest(input, output);
    });

    return task.build();
  }
}
