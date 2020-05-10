import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSESProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://cses.fi/*/task/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSES').setUrl(url);

    task.setName(elem.querySelector('.title-block > h1').textContent);
    task.setCategory(elem.querySelector('.title-block > h3 > a').textContent);

    const limitsStr = elem.querySelector('.task-constraints').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) s/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));

    const codeBlocks = elem.querySelectorAll('.content > code');
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      const input = codeBlocks[i].textContent.trim();
      const output = codeBlocks[i + 1].textContent.trim();

      task.addTest(input, output);
    }

    return task.build();
  }
}
