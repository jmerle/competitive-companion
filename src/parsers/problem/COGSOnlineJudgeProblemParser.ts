import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class COGSOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://www.cogs.pro:8081/cogs/problem/problem.php\\?pid=*',
      'http://www.cogs.pro:8081/cogs/contest/problem.php\\?ctid=*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('COGSOnlineJudge').setUrl(url);

    const pid = elem.querySelector('h1')?.textContent.split('.').at(0);
    const hid = /\?pid=\S+/.exec(url).at(0).split('=').at(1);

    await task.setName('COGS ' + (pid == undefined ? hid : pid));

    const blocks = elem.querySelectorAll('pre');

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
