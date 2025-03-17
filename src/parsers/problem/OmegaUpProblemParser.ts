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
      /https:\/\/omegaup\.com\/arena\/problem\/([^/]+)/,
      /https:\/\/omegaup\.com\/arena\/([^/]+)\/practice\/#problems\/([^/]+)/,
      /https:\/\/omegaup\.com\/arena\/([^/]+)\/?#problems\/([^/]+)/,
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('omegaUp').setUrl(url);

    const problem = elem.querySelector('#problem') || elem;

    await task.setName(problem.querySelector('.title, h3[data-problem-title]').textContent.trim());

    const contestTitleElem = elem.querySelector('.contest-title');
    if (contestTitleElem !== null) {
      task.setCategory(contestTitleElem.textContent.trim());
    }

    task.setTimeLimit(parseFloat(problem.querySelector('table tr:nth-child(2) td:first-of-type').textContent) * 1000);
    task.setMemoryLimit(parseInt(problem.querySelector('td[data-memory-limit]').textContent, 10));

    const testTable = problem.querySelector('.sample_io');
    if (testTable !== null) {
      testTable.querySelectorAll('tbody tr').forEach(row => {
        const blocks = row.querySelectorAll('pre');
        task.addTest(blocks[0].textContent, blocks[1].textContent);
      });
    }

    return task.build();
  }
}
