import * as $ from 'jquery';
import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';
import { notify } from '../../../utils';

export class GoogleCodeJamNewProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://codejam.withgoogle.com/*/challenges/*/dashboard',
      'https://codejam.withgoogle.com/*/challenges/*/dashboard/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('.task-statement').prev('h4').text();
      const contestName = 'Google Code Jam - ' + $html.find('.challenge__title > h4').text();

      const tests: Test[] = [];

      $html.find('.problem-io-wrapper').each(function () {
        const $rows = $(this).find('tr');

        for (let i = 1; i < $rows.length; i++) {
          const $columns = $rows.eq(i).find('td');

          const input = $columns.first().text();
          const output = $columns.last().text();

          tests.push(new Test(input, output));
        }
      });

      let memoryLimit = 1024;

      const regex = /Memory limit: (\d+)([a-zA-Z]+)/.exec(html);
      if (regex !== null) {
        const amount = parseInt(regex[1]);

        switch (regex[2].toUpperCase()) {
          case 'MB':
            memoryLimit = amount;
            break;
          case 'GB':
            memoryLimit = amount * 1024;
            break;
        }
      }

      notify('Google Code Jam requires you to name the output class "Solution". To do this, click on "Advanced" in the Task window that pops up, and set "Main class name" to "Solution".', 'info', 10000);

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
