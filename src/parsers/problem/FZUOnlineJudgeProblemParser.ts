import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class FZUOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.fzu.edu.cn/problem.php*', 'http://acm.fzu.edu.cn/contest/problem.php*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('FZU Online Judge').setUrl(url);

    const container = elem.querySelector('.problem');

    let name = container.querySelector('b').textContent.trim();
    if (name.startsWith('Problem ')) {
      name = name.substring(8);
    }

    task.setName(name);

    const limitsStr = container.querySelector('h3').textContent;
    task.setTimeLimit(parseInt(/(\d+) mSec/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+) KB/.exec(limitsStr)[1], 10) / 1000);

    const blocks = container.querySelectorAll('.data');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
