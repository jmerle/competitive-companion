import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSUACMOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.csu.edu.cn/csuoj/problemset/problem*', 'http://acm.csu.edu.cn/csuoj/contest/problem*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/http:\/\/acm\.csu\.edu\.cn\/csuoj\/(problemset|contest)\/problem\?(.*)/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CSU-ACM Online Judge').setUrl(url);

    const main = elem.querySelector('main');

    if (main.querySelector('.nav.nav-tabs')) {
      const name = main
        .querySelector('h2')
        .textContent.trim()
        .replace(/\((\d+)\)/, '');

      const contest = main.querySelector('h1').textContent;

      await task.setName(name);
      task.setCategory(contest);
    } else {
      await task.setName(main.querySelector('a').textContent.trim());
    }

    const mainStr = main.textContent;
    task.setTimeLimit(parseInt(/(\d+) Sec/.exec(mainStr)[1], 10) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) Mb/.exec(mainStr)[1], 10));

    const blocks = main.querySelectorAll('pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
