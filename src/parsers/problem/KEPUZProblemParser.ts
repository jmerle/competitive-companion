import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KEPUZProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://kep.uz/practice/problems/problem/2105*',
      'https://kep.uz/competitions/contests/contest/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('KEP.uz').setUrl(url);

    const containerElem = elem.querySelector('problem-body').parentElement;

    task.setName(containerElem.querySelector('.problem-title > h3, h2').textContent.trim());

    task.setTimeLimit(parseInt(elem.querySelector('.limits .bg-info').textContent.trim().split(' ')[0]));
    task.setMemoryLimit(parseInt(elem.querySelector('.limits .bg-primary').textContent.trim().split(' ')[0]));

    containerElem.querySelectorAll('.sample-test').forEach(tableElem => {
      const blocks = tableElem.querySelectorAll('pre');
      task.addTest(blocks[0].innerHTML, blocks[1].innerHTML);
    });

    return task.build();
  }
}
