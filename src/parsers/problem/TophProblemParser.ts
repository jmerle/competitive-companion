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

    task.setName(elem.querySelector('.artifact h1').textContent);
    task.setGroup('Toph');

    const limitsStr = elem.querySelector('.limits').textContent;

    task.setTimeLimit(parseFloat(/([0-9.]+)s/.exec(limitsStr)[1]) * 1000);

    const [, amount, unit] = /, ([0-9.]+) (.*)/.exec(limitsStr);
    task.setMemoryLimit(parseFloat(amount) * (unit === 'MB' ? 1 : 1024));

    elem.querySelectorAll('.table.samples').forEach(table => {
      const blocks = table.querySelectorAll('tbody > tr > td > pre');
      task.addTest(blocks[0].textContent.trim(), blocks[1].textContent.trim());
    });

    return task.build();
  }
}
