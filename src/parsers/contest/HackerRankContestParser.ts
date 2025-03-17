import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { HackerRankProblemParser } from '../problem/HackerRankProblemParser';

export class HackerRankContestParser extends ContestParser<[string, string]> {
  public getMatchPatterns(): string[] {
    return ['https://www.hackerrank.com/contests/*/challenges*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]hackerrank[.]com\/contests\/([a-z0-9-]+)\/challenges(\?(.*))?$/];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, url: string): Promise<[string, string][]> {
    const elem = htmlToElement(html);

    let contestName: string = null;
    if (elem.querySelector('a[data-attr2=contest]')) {
      contestName = elem.querySelector('a[data-attr2=contest]').getAttribute('data-attr1');
    }

    const linksSelector = '.challenges-list a.btn, .challenges-list a.challenge-list-item';
    return [...elem.querySelectorAll(linksSelector)]
      .map(el => (el as any).href.replace('www.hackerrank.com/', 'www.hackerrank.com/rest/'))
      .map(apiUrl => [contestName, apiUrl]);
  }

  protected async parseTask(input: [string, string]): Promise<Task> {
    const [contestName, apiUrl] = input;

    const body = await request(apiUrl);
    const model = JSON.parse(body).model;

    const taskUrl = apiUrl.replace('www.hackerrank.com/rest/', 'www.hackerrank.com/');
    const task = new TaskBuilder('HackerRank').setUrl(taskUrl);

    await task.setName(model.name);
    if (contestName) {
      task.setCategory(contestName);
    } else if (model.primary_contest) {
      task.setCategory(model.primary_contest.name);
    }

    new HackerRankProblemParser().parseTests(model.body_html, task);

    task.setTimeLimit(4000);
    task.setMemoryLimit(512);

    return task.build();
  }
}
