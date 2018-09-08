import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class OmegaUpProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://omegaup.com/arena/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /https:\/\/omegaup\.com\/arena\/problem\/([^\/]+)/,
      /https:\/\/omegaup\.com\/arena\/([^\/]+)\/practice\/#problems\/([^\/]+)/,
      /https:\/\/omegaup\.com\/arena\/([^\/]+)#problems\/([^\/]+)/,
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const problem = elem.querySelector('#problem');

      task.setName(problem.querySelector('.title').textContent.trim());

      const group = ['omegaUp'];

      const contestTitleElem = elem.querySelector('.contest-title');
      if (contestTitleElem !== null) {
        group.push(contestTitleElem.textContent.trim());
      }

      task.setGroup(group.join(' - '));

      task.setTimeLimit(
        parseFloat(problem.querySelector('.time_limit').textContent) * 1000,
      );

      task.setMemoryLimit(
        parseInt(problem.querySelector('.memory_limit').textContent, 10),
      );

      const testTable = problem.querySelector('.sample_io');
      if (testTable !== null) {
        testTable.querySelectorAll('tbody tr').forEach(row => {
          const blocks = row.querySelectorAll('pre');
          task.addTest(blocks[0].textContent, blocks[1].textContent);
        });
      }

      resolve(task.build());
    });
  }
}
