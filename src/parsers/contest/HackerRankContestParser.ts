import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { Contest } from '../../models/Contest';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class HackerRankContestParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.hackerrank.com/contests/*/challenges*'];
  }

  getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]hackerrank[.]com\/contests\/([a-z0-9-]+)\/challenges(\?(.*))?$/];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      const elem = htmlToElement(html);

      const links: string[] = [...elem.querySelectorAll('.challenges-list a.btn')]
        .map(el => (el as any).href.replace('www.hackerrank.com/', 'www.hackerrank.com/rest/'));

      let bodies: string[];

      try {
        bodies = await this.fetchAll(links);
      } catch (err) {
        reject(err);
        return;
      }

      const models = bodies.map(body => JSON.parse(body).model);
      const tasks = [];

      for (let i = 0; i < models.length; i++) {
        const model = models[i];
        const task = new TaskBuilder().setUrl(links[i].replace('www.hackerrank.com/rest/', 'www.hackerrank.com/'));

        task.setName(model.name);
        task.setGroup('HackerRank - ' + model.primary_contest.name);

        const div = htmlToElement(model.body_html);

        const blocks = div.querySelectorAll('.challenge-body-html pre');
        for (let i = 0; i < blocks.length; i += 2) {
          const input = blocks[i].textContent.trim();
          const output = blocks[i + 1].textContent.trim();

          task.addTest(new Test(input, output));
        }

        task.setTimeLimit(4000);
        task.setMemoryLimit(512);

        tasks.push(task.build());
      }

      resolve(new Contest(tasks));
    });
  }
}
