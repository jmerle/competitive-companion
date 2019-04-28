import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class TophProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://toph.co/p/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('.problem-statement h2').textContent);
    task.setGroup('Toph');

    const limitsStr = elem.querySelector('.problem-statement div > span').textContent;

    task.setTimeLimit(parseFloat(/Limits: ([0-9.]+)s/.exec(limitsStr)[1]) * 1000);

    const [, amount, unit] = /, ([0-9.]+) (.*)/.exec(limitsStr);
    task.setMemoryLimit(parseFloat(amount) * (unit === 'MB' ? 1 : 1024));

    const table = elem.querySelector('.problem-statement table:last-child');

    if (table !== null) {
      table.querySelectorAll('tbody tr').forEach(row => {
        const blocks = row.querySelectorAll('td > pre');
        task.addTest(blocks[0].textContent.trim(), blocks[1].textContent.trim());
      });
    }

    return task.build();
  }
}
