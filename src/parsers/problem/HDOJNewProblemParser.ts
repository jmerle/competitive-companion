import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HDOJNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/contest/problem\\?*'].flatMap(p => [p, p.replace('https', 'http')]);
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HDOJ').setUrl(url);
    const cid = /cid=\d+/g.exec(url).at(0).slice(4);
    const pid = /pid=\d+/g.exec(url).at(0).slice(4);
    const shortName = `C${cid} P${pid}`;

    const sidebar = elem.querySelector('.problem-sidebar');

    await task.setName(sidebar.querySelector('h3').textContent, shortName);

    const limits = sidebar.querySelectorAll('.info-value');

    const timeLimitStr = limits[0].textContent.split('/')[1];
    const memoryLimitStr = limits[1].textContent.split('/')[1];

    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const blocks = elem.querySelectorAll('.problem-detail-block > .code-block');

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
