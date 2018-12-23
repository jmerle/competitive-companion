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

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const name = elem
        .querySelector('h1.my-trim')
        .textContent.trim()
        .split('\n')[0];

      task.setName(name);
      task.setGroup('Jutge');
      task.setInteractive(name.includes('(Interactivo)'));

      const blocks = elem.querySelectorAll('.list-group-item pre');
      for (let i = 0; i < blocks.length; i += 4) {
        const input = blocks[i].textContent;
        const output = blocks[i + 1].textContent;

        task.addTest(input, output);
      }

      task.setTimeLimit(1000);
      task.setMemoryLimit(1024);

      resolve(task.build());
    });
  }
}
