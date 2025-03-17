import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgotesterProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://algotester.com/*/ArchiveProblem/DisplayWithFile/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Algotester').setUrl(url);

    const nameElem = elem.querySelector('.problem-name');
    await task.setName(nameElem.textContent);

    const limitsStr = nameElem.nextElementSibling.nextElementSibling.textContent;
    const limits = [...limitsStr.matchAll(/(\d+)/g)].map(v => parseInt(v[1]));
    task.setTimeLimit(limits[0] * 1000);
    task.setMemoryLimit(limits[1]);

    elem.querySelectorAll('.sample-test-content').forEach(rowElem => {
      const inputElem = rowElem.querySelector('td:first-child');
      const outputElem = rowElem.querySelector('td:last-child');
      task.addTest(inputElem.textContent, outputElem.textContent);
    });

    return task.build();
  }
}
