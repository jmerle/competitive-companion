import * as $ from 'jquery';
import Parser from "../../Parser";
import Sendable from "../../../models/Sendable";
import Test from "../../../models/Test";
import CustomTask from "../../../models/CustomTask";
import Contest from "../../../models/Contest";

export default class HackerRankContestParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.hackerrank.com/contests/*/challenges*'];
  }

  getRegularExpressions(): RegExp[] {
    return [/https:\/\/www[.]hackerrank[.]com\/contests\/([a-z0-9-]+)\/challenges(\?(.*))?$/];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      const urls = $('#contest-challenges-problem').find('a.btn')
        .toArray()
        .map(elem => $(elem).prop('href').replace('www.hackerrank.com/', 'www.hackerrank.com/rest/'));

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
          const taskName = data.model.name;
          const contestName = 'HackerRank - ' + data.model.primary_contest.name;

          const tests: Test[] = [];

          const div = document.createElement('div');
          div.innerHTML = data.model.body_html;

          $(div).find('.challenge_sample_input pre, .challenge_sample_output pre').each((i, e) => {
            const content = $(e).text().trim();

            if (i % 2 === 0) {
              tests.push(new Test(content, ''));
            } else {
              tests[tests.length - 1].output = content;
            }
          });

          return new CustomTask(taskName, contestName, tests, 256);
        });
      resolve(new Contest(tasks));
    });
  }
}
