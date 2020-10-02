import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';
import { HackerRankProblemParser } from '../problem/HackerRankProblemParser';

export class HackerRankContestParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.hackerrank.com/contests/*/challenges*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]hackerrank[.]com\/contests\/([a-z0-9-]+)\/challenges(\?(.*))?$/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    const links: string[] = [...elem.querySelectorAll('.challenges-list a.btn')].map(el =>
      (el as any).href.replace('www.hackerrank.com/', 'www.hackerrank.com/rest/'),
    );

    const bodies = await this.fetchAll(links);
    const models = bodies.map(body => JSON.parse(body).model);
    const tasks = [];

    for (let i = 0; i < models.length; i++) {
      const model = models[i];
      const task = new TaskBuilder('HackerRank').setUrl(
        links[i].replace('www.hackerrank.com/rest/', 'www.hackerrank.com/'),
      );

      task.setName(model.name);
      if (model.primary_contest) {
        task.setCategory(model.primary_contest.name);
      }

      new HackerRankProblemParser().parseTests(model.body_html, task);

      task.setTimeLimit(4000);
      task.setMemoryLimit(512);

      tasks.push(task.build());
    }

    return new Contest(tasks);
  }
}
