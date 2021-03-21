import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EOlympProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('E-Olymp').setUrl(url);

    task.setName(elem.querySelector('.eo-paper__header').textContent);

    const contestName = elem.querySelector('h1.eo-title__header').textContent;
    if (contestName !== task.name) {
      task.setCategory(contestName);
    }

    task.setTimeLimit(parseFloat(elem.querySelectorAll('.eo-message__text b')[0].textContent) * 1000);
    task.setMemoryLimit(parseInt(elem.querySelectorAll('.eo-message__text b')[1].textContent, 10));

    const blocks = elem.querySelectorAll('.mdl-grid .eo-code');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
