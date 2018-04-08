import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { CustomTask } from '../../../models/CustomTask';
import { Contest } from '../../../models/Contest';
import { Test } from '../../../models/Test';
import { htmlToElement } from '../../../utils';

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
          const taskName = data.problem_name;
          const contestName = 'CodeChef - ' + data.contest_name;

          const tests: Test[] = [];

          const div = htmlToElement(data.body);

          div.querySelectorAll('pre').forEach(pre => {
            if (pre.querySelector('b') !== null) {
              const input = pre.childNodes[1].textContent.trim();
              const output = pre.childNodes[3].textContent.trim();

              tests.push(new Test(input, output));
            }
          });

          return new CustomTask(taskName, contestName, tests, 256);
        });

      resolve(new Contest(tasks));
    });
  }
}
