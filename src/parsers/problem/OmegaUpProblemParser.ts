import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class OmegaUpProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://omegaup.com/arena/*'];
  }

  getRegularExpressions(): RegExp[] {
    return [
      /https:\/\/omegaup\.com\/arena\/problem\/([^\/]+)/,
      /https:\/\/omegaup\.com\/arena\/([^\/]+)\/practice\/#problems\/([^\/]+)/,
      /https:\/\/omegaup\.com\/arena\/([^\/]+)#problems\/([^\/]+)/,
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
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

      task.setTimeLimit(parseFloat(problem.querySelector('.time_limit').textContent) * 1000);
      task.setMemoryLimit(parseInt(problem.querySelector('.memory_limit').textContent));

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
