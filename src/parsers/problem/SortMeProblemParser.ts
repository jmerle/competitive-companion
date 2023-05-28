import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SortMeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://sort-me.org/tasks/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Sort Me').setUrl(url);

    task.setName(elem.querySelector('.task-content > h2').textContent);

    const categoryElem = elem.querySelector('.task-archive-dropdown.open > .task-archive-dropdown-title > p');
    if (categoryElem !== null) {
      task.setCategory(categoryElem.textContent);
    }

    elem.querySelectorAll('.samples-item').forEach(itemElem => {
      const blocks = itemElem.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    return task.build();
  }
}
