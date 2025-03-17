import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class MrJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://dunjudge.me/analysis/problems/*/'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('mrJudge').setUrl(url);

    await task.setName(elem.querySelector('.content-header > h1 > a').textContent);

    const limitRows = [...elem.querySelectorAll('#subtask_details > tr')];

    const maxTimeLimit = limitRows
      .map(el => parseFloat(el.children[3].textContent) * 1000)
      .reduce((a, b) => (a > b ? a : b), 0);
    task.setTimeLimit(maxTimeLimit);

    const maxMemoryLimit = limitRows
      .map(el => parseInt(el.children[4].textContent, 10))
      .reduce((a, b) => (a > b ? a : b), 0);
    task.setMemoryLimit(maxMemoryLimit);

    const codeBlocks = elem.querySelectorAll('.box-body > pre');
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
