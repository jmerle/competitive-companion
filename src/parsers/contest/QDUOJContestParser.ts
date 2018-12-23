import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class QDUOJContestParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://qduoj.com/contest/*/problems', 'https://nytdoj.com/contest/*/problems'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('#contest-main tr.ivu-table-row > td:first-child > div > span') !== null;
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      const elem = htmlToElement(html);

      const contestId = /contest\/(\d+)\/problems/.exec(url)[1];

      const links: string[] = [...elem.querySelectorAll('#contest-main tr.ivu-table-row > td:first-child > div > span')]
        .map(el => el.textContent)
        .map(problemId => `https://qduoj.com/api/contest/problem?contest_id=${contestId}&problem_id=${problemId}`);

      let bodies: string[];

      try {
        bodies = await this.fetchAll(links);
      } catch (err) {
        reject(err);
        return;
      }

      const tasks: Sendable[] = [];

      for (let i = 0; i < links.length; i++) {
        const data = JSON.parse(bodies[i]).data;
        const task = new TaskBuilder();

        task.setUrl(`https://qduoj.com/contest/${data.contest}/problem/${data._id}`);

        task.setName(data.title);
        task.setGroup(elem.querySelector('.logo > span').textContent);

        task.setTimeLimit(data.time_limit);
        task.setMemoryLimit(data.memory_limit);

        for (const sample of data.samples) {
          task.addTest(sample.input, sample.output);
        }

        tasks.push(task.build());
      }

      resolve(new Contest(tasks));
    });
  }
}
