import * as $ from 'jquery';
import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';

export class CodeChefProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.codechef.com/problems/*',
      'https://www.codechef.com/*/problems/*',
    ];
  }

  getExcludedMatchPatterns(): string[] {
    return [
      'https://www.codechef.com/problems/school',
      'https://www.codechef.com/problems/easy',
      'https://www.codechef.com/problems/medium',
      'https://www.codechef.com/problems/hard',
      'https://www.codechef.com/problems/challenge',
      'https://www.codechef.com/problems/extcontest',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('h1').last().text().trim().split('\n')[0];
      const contestName = 'CodeChef - ' + $html.find('.breadcrumbs a').last().text();

      const tests: Test[] = [];

      $html.find('pre:has(b)').each(function () {
        const input = $(this).contents().eq(1).text().trim();
        const output = $(this).contents().eq(3).text().trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, 256));
    });
  }
}
