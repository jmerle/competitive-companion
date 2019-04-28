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
    const task = new TaskBuilder().setUrl(url);

    const main = elem.querySelector('tr[valign="top"] > td[background="/images/notepad2.gif"]');

    task.setName(main.querySelector('h1').textContent);
    task.setGroup('ACMP');

    const limitsStr = main.querySelector('center > i').textContent;
    const limits = /: (\d+).*: (\d+).*: (\d+)/.exec(limitsStr);

    task.setTimeLimit(parseInt(limits[1], 10) * 1000);
    task.setMemoryLimit(parseInt(limits[2], 10));

    elem.querySelectorAll('table.main tbody > tr:not(:first-child)').forEach(row => {
      const input = row.querySelector('td:nth-child(2)').innerHTML;
      const output = row.querySelector('td:nth-child(3)').innerHTML;

      task.addTest(input.trim(), output.trim());
    });

    return task.build();
  }
}
