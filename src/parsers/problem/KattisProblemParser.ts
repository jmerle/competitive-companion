import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Test } from '../../models/Test';

export class KattisProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://*.kattis.com/problems/*',
      'https://*.kattis.com/contests/*/problems/*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('h1').innerHTML.replace(/<br>/, ' - '));

      const contestNode = elem.querySelector('h2.title');
      task.setGroup(contestNode !== null ? contestNode.textContent : 'Kattis Archive');

      elem.querySelectorAll('.sample').forEach(table => {
        const blocks = table.querySelectorAll('pre');
        const input = blocks[0].textContent;
        const output = blocks[1].textContent;

        task.addTest(new Test(input, output));
      });

      const sidebar = elem.querySelector('.problem-sidebar').textContent;
      task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(sidebar)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+) MB/.exec(sidebar)[1]));

      resolve(task.build());
    });
  }
}
