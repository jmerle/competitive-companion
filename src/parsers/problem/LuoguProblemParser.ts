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

    let c = null;
    for (const f of elem.querySelectorAll('script')) {
      const x = f.textContent;
      if (x.startsWith('window._feInjection')) {
        try {
          const h = x.indexOf('"'),
            m = x.slice(h + 1).indexOf('"'),
            b = x.slice(h + 1, h + m + 1);
          console.warn(b);
          c = JSON.parse(decodeURIComponent(b)).currentData.problem;
        } catch (err) {
          console.error(err);
        }
        break;
      }
    }
    if (c == null) {
      throw new Error('Luogu Problem Parser: Failed to find problem data');
    }
    for (const f of c.samples) {
      task.addTest(f[0], f[1]);
    }
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
