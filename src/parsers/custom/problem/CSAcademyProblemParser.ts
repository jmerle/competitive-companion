import * as $ from 'jquery';
import { Parser } from '../../Parser';
import { Sendable } from '../../../models/Sendable';
import { Test } from '../../../models/Test';
import { CustomTask } from '../../../models/CustomTask';

export class CSAcademyProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://csacademy.com/*/task/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('h1').text();
      const contestName = 'CSAcademy';

      const memoryLimit = parseInt(/(\d+) MB/.exec($html.find('em:contains("MB")').text())[1]);

      const tests: Test[] = [];

      $('table tbody tr').each(function () {
        const input = $(this).find('pre').eq(0).text().trim();
        const output = $(this).find('pre').eq(1).text().trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
