import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HydroProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://hydro.ac/p/*', 'https://hydro.ac/d/*/p/*', 'https://hydro.ac/contest/*/p/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Hydro').setUrl(url);
    const url_list = url.split('/');

    if(url.includes('/d/')) {
      const domain = url_list[url_list.length - 3];
      const pid = url_list[url_list.length - 1];
      task.setName('Hydro ' + domain + ' ' + pid);
    } else {
      const pid = url_list[url_list.length - 1];
      task.setName('Hydro P' + pid);
    }

    const blocks = [...elem.querySelectorAll('pre > code')];
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    const timeLimitStr = elem.querySelector('.icon-stopwatch').textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(timeLimitStr)[1], 10));

    const memoryLimitStr = elem.querySelector('.icon-comparison').textContent;
    task.setMemoryLimit(parseInt(/(\d+)MiB/.exec(memoryLimitStr)[1], 10));

    return task.build();
  }
}
