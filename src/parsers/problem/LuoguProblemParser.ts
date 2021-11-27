import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LuoguProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.luogu.com.cn/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const task = new TaskBuilder('Luogu').setUrl(url);

    const data = this.getProblemData(html);

    task.setName(`${data.pid} ${data.title}`.trim());

    task.setTimeLimit(Math.max(...data.limits.time));
    task.setMemoryLimit(Math.floor(Math.max(...data.limits.memory) / 1024));

    for (const sample of data.samples) {
      task.addTest(sample[0], sample[1]);
    }

    return task.build();
  }

  private getProblemData(html: string): any {
    const elem = htmlToElement(html);

    for (const scriptElem of elem.querySelectorAll('script')) {
      const script = scriptElem.textContent;
      if (script.startsWith('window._feInjection')) {
        const startQuoteIndex = script.indexOf('"');
        const endQuoteIndex = script.substr(startQuoteIndex + 1).indexOf('"');
        const encodedData = script.substr(startQuoteIndex + 1, endQuoteIndex);

        return JSON.parse(decodeURIComponent(encodedData)).currentData.problem;
      }
    }

    throw new Error('Failed to find problem data');
  }
}
