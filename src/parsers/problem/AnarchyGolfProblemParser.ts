import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AnarchyGolfProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://golf.shinh.org/p.rb?*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Anarchy Golf').setUrl(url);

    await task.setName(elem.querySelector('h1').textContent);

    task.setTimeLimit(10000);
    task.setMemoryLimit(8192);

    const preBlocks = elem.querySelectorAll('pre');
    for (let i = 0; i < preBlocks.length - 1; i += 2) {
      task.addTest(preBlocks[i].textContent, preBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
