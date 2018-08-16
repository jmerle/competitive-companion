import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeforcesProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://codeforces.com/contest/*/problem/*',
      'https://codeforces.com/contest/*/problem/*',
      'http://codeforces.com/problemset/problem/*/*',
      'https://codeforces.com/problemset/problem/*/*',
      'http://codeforces.com/gym/*/problem/*',
      'https://codeforces.com/gym/*/problem/*',
      'http://codeforces.com/group/*/contest/*/problem/*',
      'https://codeforces.com/group/*/contest/*/problem/*',
      'http://codeforces.com/problemsets/acmsguru/problem/*/*',
      'https://codeforces.com/problemsets/acmsguru/problem/*/*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const task = new TaskBuilder().setUrl(url);

      if (url.includes('/problemsets/acmsguru')) {
        const elem = htmlToElement(html);

        if (
          elem.querySelector(
            '.problemindexholder > .ttypography > .bordertable',
          ) !== null
        ) {
          this.parseAcmSguRuProblemInsideTable(html, task);
        } else {
          this.parseAcmSguRuProblemNotInsideTable(html, task);
        }
      } else {
        this.parseMainProblem(html, task);
      }

      resolve(task.build());
    });
  }

  private parseMainProblem(html: string, task: TaskBuilder) {
    const elem = htmlToElement(html);

    task.setName(
      elem.querySelector('.problem-statement > .header > .title').textContent,
    );
    task.setGroup(elem.querySelector('.rtable > tbody > tr > th').textContent);

    const timeLimitStr = elem
      .querySelector('.problem-statement > .header > .time-limit')
      .childNodes[1].textContent.split(' ')[0];
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem
      .querySelector('.problem-statement > .header > .memory-limit')
      .childNodes[1].textContent.split(' ')[0];
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    const inputs = elem.querySelectorAll('.input pre');
    const outputs = elem.querySelectorAll('.output pre');

    for (let i = 0; i < inputs.length; i++) {
      const input = inputs[i].innerHTML;
      const output = outputs[i].innerHTML;

      task.addTest(input, output);
    }
  }

  private parseAcmSguRuProblemInsideTable(html: string, task: TaskBuilder) {
    const elem = htmlToElement(html);

    task.setName(
      elem.querySelector('.problemindexholder h3').textContent.trim(),
    );
    task.setGroup('Codeforces - acm.sgu.ru archive');

    task.setTimeLimit(
      parseFloat(/time limit per test: ([0-9.]+)\s+sec/.exec(html)[1]) * 1000,
    );
    task.setMemoryLimit(
      Math.floor(
        parseInt(/memory limit per test: (\d+)\s+ KB/.exec(html)[1], 10) / 1000,
      ),
    );

    const blocks = elem.querySelectorAll('font > pre');

    for (let i = 0; i < blocks.length; i += 2) {
      const input = blocks[i].textContent;
      const output = blocks[i + 1].textContent;

      task.addTest(input, output);
    }
  }

  private parseAcmSguRuProblemNotInsideTable(html: string, task: TaskBuilder) {
    const elem = htmlToElement(html);

    task.setName(elem.querySelector('.problemindexholder h4').textContent);
    task.setGroup('Codeforces - acm.sgu.ru archive');

    task.setTimeLimit(
      parseFloat(/Time limit per test: ([0-9.]+)\s+sec/i.exec(html)[1]) * 1000,
    );
    task.setMemoryLimit(
      Math.floor(
        parseInt(
          /Memory limit(?: per test)*: (\d+)\s+(?:kilobytes|KB)/i.exec(html)[1],
          10,
        ) / 1000,
      ),
    );

    elem.querySelectorAll('table').forEach(table => {
      const blocks = table.querySelectorAll('pre');

      if (blocks.length === 4) {
        const input = blocks[2].textContent;
        const output = blocks[3].textContent;

        task.addTest(input, output);
      }
    });
  }
}
