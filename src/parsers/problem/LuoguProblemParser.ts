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
    const task = new TaskBuilder('Luogu').setUrl(url);

    if (elem.querySelector('.main-container') !== null) {
      this.parseFromPage(task, elem);
    } else {
      this.parseFromScript(task, elem);
    }

    return task.build();
  }

  private parseFromPage(task: TaskBuilder, elem: Element): void {
    task.setName(elem.querySelector('h1 > span').textContent.trim());

    const timeLimitStr = elem.querySelector('.stat > .field:nth-child(3) > .value').textContent;
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem.querySelector('.stat > .field:nth-child(4) > .value').textContent;
    task.setMemoryLimit(parseInt(memoryLimitStr));

    elem.querySelectorAll('.io-sample').forEach(sample => {
      const input = sample.querySelector('div:nth-child(1) > pre.lfe-code').textContent;
      const output = sample.querySelector('div:nth-child(2) > pre.lfe-code').textContent;

      task.addTest(input, output);
    });
  }

  private parseFromScript(task: TaskBuilder, elem: Element): void {
    const jsonElem = elem.querySelector('#lentille-context');
    if (jsonElem) {
      const json = jsonElem.textContent;
      const data = JSON.parse(json).data.problem;

      task.setName(`${data.pid} ${data.title}`.trim());

      task.setTimeLimit(Math.max(...data.limits.time));
      task.setMemoryLimit(Math.max(...data.limits.memory) / 1024);

      for (const sample of data.samples) {
        task.addTest(sample[0], sample[1]);
      }

      return;
    }

    throw new Error('Failed to find problem data');
  }
}
