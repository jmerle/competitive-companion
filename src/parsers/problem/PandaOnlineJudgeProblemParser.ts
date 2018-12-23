import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PandaOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pandaoj.com/problem/*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('.mat-card-title').textContent);
      task.setGroup('Panda Online Judge');

      const blocks = elem.querySelectorAll('pre.sample-box');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent.trim();
        const output = blocks[i + 1].textContent.trim();

        task.addTest(input, output);
      }

      const headers = elem.querySelectorAll('.mat-card-subtitle');
      task.setTimeLimit(parseInt(/Time Limit: (\d+) ms/.exec(headers[0].textContent)[1], 10));
      task.setMemoryLimit(parseInt(/Memory Limit: (\d+) MB/.exec(headers[1].textContent)[1], 10));

      resolve(task.build());
    });
  }
}
