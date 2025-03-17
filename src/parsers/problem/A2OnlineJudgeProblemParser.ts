import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class A2OnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://a2oj.com/p*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('A2 Online Judge').setUrl(url);

    const nameElem = elem.querySelector('#page > center > div');
    await task.setName(nameElem.childNodes[nameElem.childNodes.length - 1].textContent.trim());

    const blocks = [...elem.querySelectorAll('#page > div')]
      .filter(elem => elem.textContent.includes('ample'))
      .map(elem => elem.nextElementSibling);

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
