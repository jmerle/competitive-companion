import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ACMPProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acmp.ru/*/index.asp*', 'https://acmp.ru/*/index.asp*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/https?:\/\/acmp\.ru\/.*\/?index\.asp\?.*((id_task=\d+)|(id_problem=\d+)).*/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ACMP').setUrl(url);

    const main = elem.querySelector('tr[valign="top"] > td[background="/images/notepad2.gif"]');

    await task.setName(main.querySelector('h1').textContent);

    const limitsStr = main.querySelector('center > i').textContent;
    const limits = /: (\d+).*: (\d+).*: (\d+)/.exec(limitsStr);

    task.setTimeLimit(parseInt(limits[1], 10) * 1000);
    task.setMemoryLimit(parseInt(limits[2], 10));

    elem.querySelectorAll('table.main tbody > tr:not(:first-child)').forEach(row => {
      if (row.querySelectorAll('td').length !== 3) {
        return;
      }

      const input = row.querySelector('td:nth-child(2)').textContent;
      const output = row.querySelector('td:nth-child(3)').textContent;

      task.addTest(input, output);
    });

    return task.build();
  }
}
