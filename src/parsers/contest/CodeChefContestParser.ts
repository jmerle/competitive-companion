import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Contest } from '../../models/Contest';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

export class CodeChefContestParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.codechef.com/*'];
  }

  canHandlePage(): boolean {
    return document.querySelector('.cc-problem-name a') !== null;
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      const elem = htmlToElement(html);

      const links = [...elem.querySelectorAll('.cc-problem-name a')]
        .map(el => (el as any).href.replace('www.codechef.com/', 'www.codechef.com/api/contests/'));

      let bodies: string[];

      try {
        bodies = await this.fetchAll(links);
      } catch (err) {
        reject(err);
        return;
      }

      const tasks = bodies
        .map(body => JSON.parse(body))
        .map(data => {
          const task = new TaskBuilder();

          task.setName(data.problem_name);
          task.setGroup('CodeChef - ' + data.contest_name);

          const div = htmlToElement(data.body);

          div.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('b') !== null) {
              const input = pre.childNodes[1].textContent.trim();
              const output = pre.childNodes[3].textContent.trim();

              task.addTest(new Test(input, output));
            }
          });

          task.setTimeLimit(parseFloat(data.max_timelimit) * 1000);
          task.setMemoryLimit(256);

          return task.build();
        });

      resolve(new Contest(tasks));
    });
  }
}
