import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgoZenithProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.learning.algozenith.com/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AlgoZenith').setUrl(url);

    task.setName(elem.querySelector('#home .tab_card_header p').textContent.trim());

    const timeLimitStr = elem.querySelector('.fa-stopwatch').parentElement.textContent;
    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1]) * 1000);

    const memoryLimitStr = elem.querySelector('.fa-sd-card').parentElement.textContent;
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1]));

    const blocks = elem.querySelectorAll('p.input + pre > code');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
