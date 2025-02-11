import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MarisaOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://marisaoj.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('MarisaOJ').setUrl(url);

    task.setName(elem.querySelector('.header > h2').textContent.trim());
    task.setCategory(elem.querySelector('#module-info > .problem-table > caption').textContent.trim());

    const [timeLimitElem, memoryLimitElem] = [...elem.querySelectorAll('.header > div')];

    task.setTimeLimit(parseInt(timeLimitElem.textContent.match(/\d+/)[0], 10));
    task.setMemoryLimit(parseInt(memoryLimitElem.textContent.match(/\d+/)[0], 10));

    const bodyElems = elem.querySelector('.math-content').children;

    for (let i = 0; i < bodyElems.length; i++) {
      if (bodyElems[i].textContent.includes('Input:')) {
        task.addTest(bodyElems[i + 1].textContent, bodyElems[i + 3].textContent);
        i += 3;
      }
    }

    return task.build();
  }
}
