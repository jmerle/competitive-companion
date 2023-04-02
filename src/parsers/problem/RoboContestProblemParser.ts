import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class RoboContestProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://robocontest.uz/tasks/*', 'https://robocontest.uz/olympiads/*/tasks/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('RoboContest').setUrl(url);

    const container = elem.querySelector('.card.mb-3');

    task.setName(container.querySelector('h1.h4').textContent.trim());

    if (elem.querySelector('.breadcrumb > .breadcrumb-item:nth-child(2) > a').textContent === 'Olimpiadalar') {
      task.setCategory(elem.querySelector('.breadcrumb-item.active').textContent);
    }

    task.setTimeLimit(parseInt(/(\d+)/.exec(container.querySelector('#time_info').textContent)[1]));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(container.querySelector('#memory_info').textContent)[1]));

    task.setInput({
      type: 'file',
      fileName: container.querySelector('table.monotext tr > th:nth-child(2)').textContent,
    });

    task.setOutput({
      type: 'file',
      fileName: container.querySelector('table.monotext tr > th:nth-child(3)').textContent,
    });

    const blocks = container.querySelectorAll('table.monotext pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
