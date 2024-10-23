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

    const urls = url.split('/');
    const pid = urls[urls.length - 1];

    if (pid.includes('contestId')) {
      const cid = /\?contestId=\d+/.exec(pid).at(0);
      task.setName('Luogu C' + cid.replace('?contestId=', '') + ' ' + pid.replace(cid, ''));
    } else {
      task.setName('Luogu ' + pid);
    }

    if (elem.querySelector('.main-container') !== null) {
      this.parseFromPage(task, elem);
    } else {
      this.parseFromScript(task, elem);
    }

    return task.build();
  }

  private parseFromPage(task: TaskBuilder, elem: Element): void {
    const timeLimitStr = elem.querySelector('.stat > .field:nth-child(3) > .value').textContent;
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem.querySelector('.stat > .field:nth-child(4) > .value').textContent;
    task.setMemoryLimit(parseInt(memoryLimitStr));

    elem.querySelectorAll('.sample').forEach(sample => {
      const input = sample.querySelector('.input > pre').textContent;
      const output = sample.querySelector('.output > pre').textContent;

      task.addTest(input, output);
    });
  }

  private parseFromScript(task: TaskBuilder, elem: Element): void {
    for (const scriptElem of elem.querySelectorAll('script')) {
      const script = scriptElem.textContent;
      if (script.startsWith('window._feInjection')) {
        const startQuoteIndex = script.indexOf('"');
        const endQuoteIndex = script.substr(startQuoteIndex + 1).indexOf('"');
        const encodedData = script.substr(startQuoteIndex + 1, endQuoteIndex);

        const data = JSON.parse(decodeURIComponent(encodedData)).currentData.problem;

        task.setName(`${data.pid} ${data.title}`.trim());

        task.setTimeLimit(Math.max(...data.limits.time));
        task.setMemoryLimit(Math.max(...data.limits.memory) / 1024);

        for (const sample of data.samples) {
          task.addTest(sample[0], sample[1]);
        }

        return;
      }
    }

    throw new Error('Failed to find problem data');
  }
}
