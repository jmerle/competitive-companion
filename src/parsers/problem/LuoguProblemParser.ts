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

    this.setContestCategory(task, elem);

    return task.build();
  }

  private setContestCategory(task: TaskBuilder, elem: Element): void {
    const script = elem.querySelector('#lentille-context');
    if (script === null) {
      return;
    }
    try {
      const name = JSON.parse(script.textContent).data?.contest?.name;
      if (typeof name === 'string' && name.length > 0) {
        task.setCategory(name);
      }
    } catch {
      // ignore parse errors and leave the category unset
    }
  }

  private parseFromPage(task: TaskBuilder, elem: Element): void {
    task.setName(elem.querySelector('h1').textContent.trim());

    const timeLimitStr = elem.querySelector('.stat > .field:nth-child(3) > .value').textContent.trim();
    // The value may be a single limit ("1.00s", "500ms") or a range showing min and
    // max across testdata ("500ms ~ 3.00s"). Use the last number-unit pair, which is
    // the upper bound the solution actually has to fit in.
    const timeMatch = /([0-9.]+)\s*(ms|s)\s*$/i.exec(timeLimitStr);
    if (timeMatch !== null) {
      const value = parseFloat(timeMatch[1]);
      task.setTimeLimit(Math.round(timeMatch[2].toLowerCase() === 'ms' ? value : value * 1000));
    }

    const memoryLimitStr = elem.querySelector('.stat > .field:nth-child(4) > .value').textContent;
    const memoryLimitAmount = parseFloat(memoryLimitStr.substring(0, memoryLimitStr.length - 2));
    const memoryLimitUnit = memoryLimitStr.substring(memoryLimitStr.length - 2);
    const memoryLimitConverted = memoryLimitUnit == 'MB' ? memoryLimitAmount : memoryLimitAmount * 1024;
    task.setMemoryLimit(Math.floor(memoryLimitConverted));

    elem.querySelectorAll('.io-sample').forEach(sample => {
      const blocks = sample.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });
  }

  private parseFromScript(task: TaskBuilder, elem: Element): void {
    const script = elem.querySelector('#lentille-context').textContent;
    const data = JSON.parse(script).data.problem;

    task.setName(`${data.pid} ${data.title}`.trim());

    task.setTimeLimit(Math.max(...data.limits.time));
    task.setMemoryLimit(Math.max(...data.limits.memory) / 1024);

    for (const sample of data.samples) {
      task.addTest(sample[0], sample[1]);
    }
  }
}
