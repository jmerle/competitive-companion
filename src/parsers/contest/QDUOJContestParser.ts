import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';

export class QDUOJContestParser extends ContestParser<[string, string]> {
  public getMatchPatterns(): string[] {
    return ['https://qduoj.com/contest/*/problems', 'https://nytdoj.com/contest/*/problems'];
  }

  public canHandlePage(): boolean {
    return document.querySelector('#contest-main tr.ivu-table-row > td:first-child > div > span') !== null;
  }

  protected async getTasksToParse(html: string, url: string): Promise<[string, string][]> {
    const elem = htmlToElement(html);

    const contestId = /contest\/(\d+)\/problems/.exec(url)[1];
    const judge = elem.querySelector('.logo > span').textContent;

    return [...elem.querySelectorAll('#contest-main tr.ivu-table-row > td:first-child > div > span')]
      .map(el => el.textContent)
      .map(problemId => `https://qduoj.com/api/contest/problem?contest_id=${contestId}&problem_id=${problemId}`)
      .map(url => [judge, url]);
  }

  protected async parseTask(input: [string, string]): Promise<Task> {
    const [judge, url] = input;
    const body = await request(url);

    const data = JSON.parse(body).data;
    const task = new TaskBuilder(judge);

    task.setUrl(`https://qduoj.com/contest/${data.contest}/problem/${data._id}`);

    await task.setName(data.title);

    task.setTimeLimit(data.time_limit);
    task.setMemoryLimit(data.memory_limit);

    for (const sample of data.samples) {
      task.addTest(sample.input, sample.output);
    }

    return task.build();
  }
}
