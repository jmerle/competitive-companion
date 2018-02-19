import * as $ from 'jquery';
import Parser from '../../Parser';
import Sendable from '../../../models/Sendable';
import Test from '../../../models/Test';
import CustomTask from '../../../models/CustomTask';

export default class EOlympProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/problems/*'];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('.eo-paper__header').text();

      const contestNameParts = ['E-Olymp', $html.find('.eo-title__header').eq(1).text()];

      if (contestNameParts[1] === taskName) {
        contestNameParts.pop();
      }

      const contestName = contestNameParts.join(' - ');

      const memoryLimit = parseInt($html.find('.eo-message__text b').last().text());

      const tests: Test[] = [];

      $html.find('.mdl-grid').has('.eo-code').each(function () {
        const input = $(this).find('.eo-code').eq(0).text().trim();
        const output = $(this).find('.eo-code').eq(1).text().trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, memoryLimit));
    });
  }
}
