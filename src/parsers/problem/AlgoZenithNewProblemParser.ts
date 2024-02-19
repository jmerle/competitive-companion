import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgoZenithNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://maang.in/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AlgoZenith').setUrl(url);

    task.setName(elem.querySelector('h4').textContent);

    const timeLimitStr = elem.querySelector('h4 + div > div:nth-child(2) > p').textContent;
    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1]) * 1000);

    const memoryLimitStr = elem.querySelector('h4 + div > div:nth-child(3) > p').textContent;
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1]) / 1000);

    const blocks = elem.querySelectorAll('.mt-4 .coding_input_format__v5xo8');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
