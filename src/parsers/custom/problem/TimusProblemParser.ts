import * as $ from 'jquery';
import Parser from '../../Parser';
import Sendable from '../../../models/Sendable';
import Test from '../../../models/Test';
import CustomTask from '../../../models/CustomTask';

export default class TimusProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://acm.timus.ru/problem.aspx*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('.problem_title').text();

      const limits = $html.find('.problem_limits').text().trim();
      const memoryLimit = parseInt(/(\d+) (.){2}$/.exec(limits)[1]);

      const source = $html.find('.problem_source').text();

      let contestName = 'Timus';

      if (/Problem Source: (.*)$/.test(source)) {
        contestName += ' - ' + /Problem Source: (.*)$/.exec(source)[1];
      }

      const tests: Test[] = [];

      $('.sample tbody tr:not(:first)').each(function () {
        const input = $(this).find('td').eq(0).text().trim();
        const output = $(this).find('td').eq(1).text().trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
