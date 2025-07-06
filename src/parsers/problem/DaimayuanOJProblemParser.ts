import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class DaimayuanOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://bs.daimayuan.top/p/*'];
  }
  public async parse(url: string, html: string): Promise<Sendable> {
    const validUrlRegex = /^https:\/\/bs\.daimayuan\.top\/p\/\d+(\?tid=.*)?$/;
    if (!validUrlRegex.test(url)) {
      return null;
    }
    const elem = htmlToElement(html);
    const task = new TaskBuilder('DaimayuanOJ').setUrl(url);

    const h1 = elem.querySelector('h1.section__title');
    if (h1) {
      const h1Clone = h1.cloneNode(true) as HTMLElement;
      h1Clone.querySelectorAll('a, form').forEach(child => child.remove());
      const title = h1Clone.textContent.trim();
      task.setName(title);
    }

    const timeLimitStr = elem.querySelector('.icon-stopwatch').textContent;
    task.setTimeLimit(Number(timeLimitStr.replace('ms', '')));
    const memoryLimitStr = elem.querySelector('.icon-comparison').textContent;
    task.setMemoryLimit(Number(memoryLimitStr.replace('MiB', '')));

    const allSamples = elem.querySelectorAll('div.code-toolbar > pre > code');
    for (let i = 0; i < allSamples.length; i += 2) {
      const input = allSamples[i].textContent;
      const output = allSamples[i + 1].textContent;
      task.addTest(input, output);
    }
    return task.build();
  }
}