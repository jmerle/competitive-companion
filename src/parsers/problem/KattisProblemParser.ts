import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KattisProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://*.kattis.com/problems/*', 'https://*.kattis.com/contests/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Kattis').setUrl(url);

    task.setName(elem.querySelector('h1').innerHTML.replace(/<br>/, ' - '));

    const contestNode = elem.querySelector('h2.title');
    if (contestNode !== null) {
      task.setCategory(contestNode.textContent);
    }

    task.setInteractive([...elem.querySelectorAll('h2')].some(el => (el as any).textContent === 'Interaction'));

    const sidebar = elem.querySelector('.problem-sidebar').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(sidebar)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(sidebar)[1], 10));

    elem.querySelectorAll('.sample').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks.length > 1 ? blocks[1].textContent : '');
    });

    return task.build();
  }
}
