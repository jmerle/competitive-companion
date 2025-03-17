import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class JutgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://jutge.org/problems/*'];
  }

  public canHandlePage(): boolean {
    return [...document.querySelectorAll('.panel-heading')].some(el => el.textContent.includes('Statement'));
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Jutge').setUrl(url);

    const name = elem.querySelector('h1.my-trim').textContent.trim().split('\n')[0];

    await task.setName(name);
    task.setInteractive(name.includes('(Interactivo)'));

    const blocks = elem.querySelectorAll('.list-group-item pre');
    for (let i = 0; i < blocks.length; i += 4) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    task.setTimeLimit(1000);
    task.setMemoryLimit(1024);

    return task.build();
  }
}
