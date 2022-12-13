import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HustOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [''];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('LSYOI').setUrl(url);

    task.setName(elem.querySelector('.container > .panel').childNodes[1].childNodes[1].textContent.trim());

    task.addTest(elem.querySelector('#sampleinput').textContent, document.querySelector('#sampleoutput').textContent);

    const timeLimitStr = elem.querySelectorAll('.green')[0].nextSibling.firstChild.textContent;
    task.setTimeLimit(parseInt(Math.ceil(parseFloat(timeLimitStr)*1000).toString(),10));

    const memoryLimitStr = elem.querySelectorAll('.green')[1].nextSibling.textContent;
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(memoryLimitStr)[1], 10));

    return task.build();
  }
}
