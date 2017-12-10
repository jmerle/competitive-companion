import * as $ from 'jquery';
import Parser from "../../Parser";
import CustomTask from "../../../models/CustomTask";
import Test from "../../../models/Test";
import Sendable from "../../../models/Sendable";

export default class HackerRankProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.hackerrank.com/challenges/*/problem',
      'https://www.hackerrank.com/contests/*/challenges/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('.challenge-view h2:first').text().trim();

      const breadCrumbs = $html.find('ol.bcrumb li').map((i, e) => $(e).find('a span').text()).toArray();
      const contestName = ['HackerRank', ...breadCrumbs.slice(1, -1)].join(' - ');

      const tests: Test[] = [];

      $html.find('.challenge_sample_input pre, .challenge_sample_output pre').each((i, e) => {
        const content = $(e).text().trim();

        if (i % 2 === 0) {
          tests.push(new Test(content, ''));
        } else {
          tests[tests.length - 1].output = content;
        }
      });

      resolve(new CustomTask(taskName, contestName, tests, 512));
    });
  }
}
