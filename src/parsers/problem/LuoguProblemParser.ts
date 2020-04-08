import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LuoguProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.luogu.com.cn/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('.header > h1').textContent);
    task.setGroup('Luogu Online Judge');

    const timeLimitStr = document.querySelector('.stat > .field:nth-last-child(2) > .value').textContent;
    task.setTimeLimit(parseFloat(timeLimitStr) * (timeLimitStr.endsWith('ms') ? 1 : 1000));

    const memoryLimitStr = document.querySelector('.stat > .field:nth-last-child(1) > .value').textContent;
    task.setMemoryLimit(parseFloat(memoryLimitStr));

    elem.querySelectorAll('.sample').forEach(block => {
      const input = block.querySelector('.input > pre').textContent.trim();
      const output = block.querySelector('.output > pre').textContent.trim();

      task.addTest(input, output);
    });

    return task.build();
  }
}
