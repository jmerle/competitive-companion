import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PandaOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pandaoj.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Panda Online Judge').setUrl(url);

    await task.setName(elem.querySelector('.mat-card-title').textContent);

    const blocks = elem.querySelectorAll('pre.sample-box');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    const headers = elem.querySelectorAll('.mat-card-subtitle');
    task.setTimeLimit(parseInt(/Time Limit: (\d+) ms/.exec(headers[0].textContent)[1], 10));
    task.setMemoryLimit(parseInt(/Memory Limit: (\d+) MB/.exec(headers[1].textContent)[1], 10));

    return task.build();
  }
}
