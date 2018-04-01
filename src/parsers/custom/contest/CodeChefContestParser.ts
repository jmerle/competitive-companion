import * as $ from 'jquery';
import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { CustomTask } from '../../../models/CustomTask';
import { Contest } from '../../../models/Contest';
import { Test } from '../../../models/Test';

export class CodeChefContestParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.codechef.com/*'];
  }

  canHandlePage(): boolean {
    return $('.cc-problem-name a').length > 0;
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      const urls = $('.cc-problem-name a')
        .toArray()
        .map(elem => $(elem).prop('href').replace('www.codechef.com/', 'www.codechef.com/api/contests/'));

      let bodies: string[];

      try {
        bodies = await this.fetchAll(urls);
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

          const div = document.createElement('div');
          div.innerHTML = data.body;

          $(div).find('pre:has(b)').each(function () {
            const input = $(this).contents().eq(1).text().trim();
            const output = $(this).contents().eq(3).text().trim();

            tests.push(new Test(input, output));
          });

          return new CustomTask(taskName, contestName, tests, 256);
        });

      resolve(new Contest(tasks));
    });
  }
}
