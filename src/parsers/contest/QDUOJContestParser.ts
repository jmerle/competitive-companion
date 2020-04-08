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

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    const contestId = /contest\/(\d+)\/problems/.exec(url)[1];

    const links: string[] = [...elem.querySelectorAll('#contest-main tr.ivu-table-row > td:first-child > div > span')]
      .map(el => el.textContent)
      .map(problemId => `https://qduoj.com/api/contest/problem?contest_id=${contestId}&problem_id=${problemId}`);

    const bodies = await this.fetchAll(links);
    const tasks: Sendable[] = [];

    for (let i = 0; i < links.length; i++) {
      const data = JSON.parse(bodies[i]).data;
      const task = new TaskBuilder(elem.querySelector('.logo > span').textContent);

      task.setUrl(`https://qduoj.com/contest/${data.contest}/problem/${data._id}`);

      task.setName(data.title);

      task.setTimeLimit(data.time_limit);
      task.setMemoryLimit(data.memory_limit);

      for (const sample of data.samples) {
        task.addTest(sample.input, sample.output);
      }

      tasks.push(task.build());
    }

    return new Contest(tasks);
  }
}
