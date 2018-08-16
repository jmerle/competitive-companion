import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EOlympProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.e-olymp.com/*/problems/*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('.eo-paper__header').textContent);

      const contestNameParts = [
        'E-Olymp',
        elem.querySelector('.eo-title__header').textContent,
      ];
      if (contestNameParts[1] === task.name) {
        contestNameParts.pop();
      }

      task.setGroup(contestNameParts.join(' - '));

      task.setTimeLimit(
        parseFloat(
          elem.querySelectorAll('.eo-message__text b')[0].textContent,
        ) * 1000,
      );
      task.setMemoryLimit(
        parseInt(
          elem.querySelectorAll('.eo-message__text b')[1].textContent,
          10,
        ),
      );

      const blocks = elem.querySelectorAll('.mdl-grid .eo-code');
      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent;
        const output = blocks[i + 1].textContent;

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
