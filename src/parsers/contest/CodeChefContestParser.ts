import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Contest } from '../../models/Contest';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class CodeChefContestParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.codechef.com/*'];
  }

  canHandlePage(): boolean {
    return document.querySelector('.cc-problem-name a') !== null;
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      const elem = htmlToElement(html);

      const links: string[] = [...elem.querySelectorAll('.cc-problem-name a')]
        .map(el => (el as any).href.replace('www.codechef.com/', 'www.codechef.com/api/contests/'));

      let bodies: string[];

      try {
        bodies = await this.fetchAll(links);
      } catch (err) {
        reject(err);
        return;
      }

      const models = bodies.map(body => JSON.parse(body));
      const tasks = [];

      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const task = new TaskBuilder().setUrl(links[i].replace('www.codechef.com/api/contests/', 'www.codechef.com/'));

        task.setName(model.problem_name);
        task.setGroup('CodeChef - ' + model.contest_name);

        const div = htmlToElement(model.body);

        div.querySelectorAll('pre').forEach(pre => {
          if (pre.querySelector('b') !== null) {
            const input = pre.childNodes[1].textContent.trim();
            const output = pre.childNodes[3].textContent.trim();

            task.addTest(new Test(input, output));
          }
        });

        task.setTimeLimit(parseFloat(model.max_timelimit) * 1000);
        task.setMemoryLimit(256);

        tasks.push(task.build());
      }

      resolve(new Contest(tasks));
    });
  }
}
