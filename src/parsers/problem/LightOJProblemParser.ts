import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LightOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://lightoj.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('LightOJ').setUrl(url);

    task.setName(elem.querySelector('.title > p').textContent.trim());

    const timeLimitStr = elem.querySelector('.limit-section > span:first-child').textContent.trim();
    task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(timeLimitStr)[1]) * 1000);

    const memoryLimitStr = elem.querySelector('.limit-section > span:nth-child(2)').textContent.trim();
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(memoryLimitStr)[1], 10));

    const blocks = elem.querySelectorAll('.sample-dataset-section .dataset-container');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      const input = blocks[i].textContent;
      const output = blocks[i + 1].textContent;

      task.addTest(input, output);
    }

    return task.build();
  }
}
