import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CPythonUZProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://cpython.uz/practice/problems/problem/*',
      'https://cpython.uz/competitions/contests/contest/*/problem/*',
      'https://cpython.uz/practice/duels/duel/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CPython.uz').setUrl(url);

    const nameSelector =
      url.includes('contests/contest') || url.includes('duels/duel') ? 'h2.text-center' : 'h2.content-header-title';
    await task.setName(elem.querySelector(nameSelector).textContent.trim());

    if (url.includes('contests/contest')) {
      const title = elem.querySelector('title').textContent;
      task.setCategory(title.replace(`${task.name} | `, '').replace(' | Contest | CPython.uz', ''));
    }

    const limitsSelector = url.includes('duels/duel') ? '.card-body' : '.limits';
    const limitsStr = elem.querySelector(limitsSelector).textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1]));
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1]));

    elem.querySelectorAll('.sample-test').forEach(tableElem => {
      const blocks = tableElem.querySelectorAll('pre');
      task.addTest(blocks[0].innerHTML, blocks[1].innerHTML);
    });

    return task.build();
  }
}
