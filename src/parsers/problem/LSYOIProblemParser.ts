import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LSYOIProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://lsyoi.top:88/problem.php?*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('LSYOI').setUrl(url);

    task.setName(elem.querySelector('.container > .panel').childNodes[1].childNodes[1].textContent.trim());

    task.addTest(elem.querySelector('#sampleinput').textContent, document.querySelector('#sampleoutput').textContent);

    const timeLimitStr = elem.querySelectorAll('.green')[0].nextElementSibling.firstChild.textContent;
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem.querySelectorAll('.green')[1].nextSibling.textContent;
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(memoryLimitStr)[1], 10));

    return task.build();
  }
}
