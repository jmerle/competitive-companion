import * as $ from 'jquery';
import Parser from "../../Parser";
import Sendable from "../../../models/Sendable";
import Test from "../../../models/Test";
import CustomTask from "../../../models/CustomTask";

export default class HackerEarthProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://www.hackerearth.com/*/algorithm/*',
      'https://www.hackerearth.com/*/approximate/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      const taskName = $html.find('#problem-title').text().trim();

      let contestNameSuffix: string[] = [];

      if ($html.find('.timings').length > 0) {
        contestNameSuffix = [$html.find('.cover .title').text().trim()];
      } else {
        contestNameSuffix = $html.find('.breadcrumb a').toArray().map(elem => $(elem).text()).slice(1);
      }

      const contestName = ['HackerEarth', ...contestNameSuffix].join(' - ');

      const tests: Test[] = [];

      $html.find('.input-output-container').each(function () {
        const input = $(this).find('pre').eq(0).text().trim();
        const output = $(this).find('pre').eq(1).text().trim();

        tests.push(new Test(input, output));
      });

      resolve(new CustomTask(taskName, contestName, tests, 256));
    });
  }
}
