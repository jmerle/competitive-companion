import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSESProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://cses.fi/*/task/*', 'https://www.cses.fi/*/task/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSES').setUrl(url);

    await task.setName(elem.querySelector('.title-block > h1').textContent);
    task.setCategory(elem.querySelector('.title-block > h3 > a').textContent);

    const limitsStr = elem.querySelector('.task-constraints').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) s/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));

    // Grabs the first two code blocks after each "example" header, to avoid
    // matching code blocks in the problem statement or explanations.
    const find = function (nodes: Element[]): Element[] {
      let count = 0;
      const result: Element[] = [];
      for (let i = 0; i < nodes.length; i++) {
        if (nodes[i].id.startsWith('example')) {
          count = 2;
          continue;
        }
        if (count > 0) {
          result.push(nodes[i]);
          count--;
        }
      }
      return result;
    };

    const codeBlocks = find([...elem.querySelectorAll('[id^=example], .content pre')]);
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
