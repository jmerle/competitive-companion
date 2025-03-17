import type { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LightOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://lightoj.com/problem/*', 'https://lightoj.com/contest/*/arena/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('LightOJ').setUrl(url);

    await task.setName(elem.querySelector('.title').textContent.trim());

    const limitElems = elem.querySelectorAll('.tooltip-trigger > span');
    task.setTimeLimit(parseFloat(/([0-9.]+)/.exec(limitElems[0].textContent)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+)/.exec(limitElems[1].textContent)[1], 10));

    const blocks = elem.querySelectorAll('.sample-dataset-section .dataset-container');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
