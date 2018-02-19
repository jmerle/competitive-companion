import * as $ from 'jquery';
import Parser from '../../Parser';
import Sendable from '../../../models/Sendable';
import Test from '../../../models/Test';
import CustomTask from '../../../models/CustomTask';

export default class CodeforcesProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*/problem/*',
      'http://codeforces.com/problemset/problem/*/*',
      'http://codeforces.com/gym/*/problem/*',
      'http://codeforces.ru/contest/*/problem/*',
      'http://codeforces.ru/problemset/problem/*/*',
      'http://codeforces.ru/gym/*/problem/*',
    ];
  }

  parse(html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const $html = $(html);

      let taskName = $html.find('.problem-statement > .header > .title').text();
      taskName = taskName.replace('.', ' -');
      taskName = 'Problem ' + taskName;

      const contestName = $html.find('.rtable > tbody > tr > th').text();

      let memoryLimit = $html
        .find('.problem-statement > .header > .memory-limit')
        .contents()
        .filter(function () {
          return this.nodeType === Node.TEXT_NODE;
        })
        .first()
        .text();

      memoryLimit = memoryLimit.substr(0, memoryLimit.indexOf(' '));

      const tests: Test[] = [];
      const testCount = $html.find('.input').length;

      for (let i = 0; i < testCount; i++) {
        const $input = $html.find('.input').eq(i);
        const $output = $html.find('.output').eq(i);

        const input = $input.find('pre').html();
        const output = $output.find('pre').html();

        tests.push(new Test(input, output));
      }

      resolve(new CustomTask(taskName, contestName, tests, parseInt(memoryLimit)));
    });
  }
}
