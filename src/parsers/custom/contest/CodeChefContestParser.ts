import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { CustomTask } from '../../../models/CustomTask';
import { Contest } from '../../../models/Contest';
import { htmlToElement, markdownToHtml } from '../../../utils';
import { CodeChefProblemParser } from '../problem/CodeChefProblemParser';

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

          const html = markdownToHtml(data.body);
          const tests = new CodeChefProblemParser().parseTests(html);

          return new CustomTask(taskName, contestName, tests, 256);
        });

      resolve(new Contest(tasks));
    });
  }
}
