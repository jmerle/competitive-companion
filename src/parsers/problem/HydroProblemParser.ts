import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HydroProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns = [];

    for (const domain of ['hydro.ac', 'oiclass.com']) {
      for (const path of ['p/*', 'd/*/p/*', 'contest/*/p/*']) {
        patterns.push(`https://${domain}/${path}`);
      }
    }

    return patterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Hydro').setUrl(url);

    task.setName(elem.querySelector('.section__title').lastChild.textContent.trim());

    const blocks = [...elem.querySelectorAll('.sample > pre > code')];
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
