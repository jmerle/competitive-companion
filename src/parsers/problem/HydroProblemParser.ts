import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HydroProblemParser extends Parser {
  public static DOMAINS = {
    'hydro.ac': 'Hydro',
    'oiclass.com': 'oiClass',
    'newoj.cyezoi.com': 'CYEZOJ',
    'oj.33dai.cn': '33OJ',
    'bs.daimayuan.top': 'Daimayuan Online Judge',
    'yundouxueyuan.com': 'Yun Dou Xue Yuan',
  };

  public getMatchPatterns(): string[] {
    const patterns = [];

    for (const domain of Object.keys(HydroProblemParser.DOMAINS)) {
      for (const path of ['p/*', 'd/*/p/*', 'contest/*/p/*']) {
        patterns.push(`https://${domain}/${path}`);
      }
    }

    return patterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const domain = Object.entries(HydroProblemParser.DOMAINS).find(entry => url.startsWith(`https://${entry[0]}`));
    const judge = domain !== undefined ? domain[1] : 'Hydro';

    const elem = htmlToElement(html);
    const task = new TaskBuilder(judge).setUrl(url);

    task.setName(elem.querySelector('.section__title').lastChild.textContent.trim());

    const blocks = [...elem.querySelectorAll('.sample > pre > code')];
    if (judge === 'Daimayuan Online Judge') {
      blocks.push(...elem.querySelectorAll('h2 + .code-toolbar > pre > code'));
    }

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
