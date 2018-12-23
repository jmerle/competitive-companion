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

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const main = elem.querySelector('main');

      if (main.querySelector('.nav.nav-tabs')) {
        const name = main
          .querySelector('h2')
          .textContent.trim()
          .replace(/\((\d+)\)/, '');

        const contest = main.querySelector('h1').textContent;

        task.setName(name);
        task.setGroup(`CSU-ACM Online Judge - ${contest}`);
      } else {
        task.setName(main.querySelector('a').textContent.trim());
        task.setGroup('CSU-ACM Online Judge');
      }

      const mainStr = main.textContent;
      task.setTimeLimit(parseInt(/(\d+) Sec/.exec(mainStr)[1], 10) * 1000);
      task.setMemoryLimit(parseInt(/(\d+) Mb/.exec(mainStr)[1], 10));

      const blocks = main.querySelectorAll('pre');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent;
        const output = blocks[i + 1].textContent;

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
