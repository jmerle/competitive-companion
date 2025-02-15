import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KattisProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://*.kattis.com/problems/*',
      'https://*.kattis.com/*/problems/*',
      'https://*.kattis.com/contests/*/problems/*',
      'https://*.kattis.com/sessions/*/problems/*',
      'https://*.kattis.com/challenge/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Kattis').setUrl(url);

    task.setName(elem.querySelector('h1').innerHTML.replace(/<br>/, ' - '));

    if (elem.querySelector('.breadcrumb > .breadcrumb-link:first-child')?.textContent === 'Contests') {
      task.setCategory(elem.querySelector('.breadcrumb > .breadcrumb-link:nth-of-type(2)').textContent);
    }

    task.setInteractive([...elem.querySelectorAll('h2')].some(el => (el as any).textContent === 'Interaction'));

    const limitsStr = elem.querySelector('.metadata-grid').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));

    elem.querySelectorAll('.sample').forEach(table => {
      const inputBlock = table.querySelector('tbody > tr:last-child > td:first-child > pre');
      const outputBlock = table.querySelector('tbody > tr:last-child > td:last-child > pre');

      const input = inputBlock !== null ? inputBlock.textContent : '';
      const output = outputBlock !== null ? outputBlock.textContent : '';

      task.addTest(input, output, false);
    });

    return task.build();
  }
}
