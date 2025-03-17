import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HKOIOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://judge.hkoi.org/task/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HKOI Online Judge').setUrl(url);

    await task.setName(elem.querySelector('a.print-nolink').innerHTML);

    const info = elem.querySelectorAll('div.task-info button');
    if (info != null && info.length == 4) {
      task.setTimeLimit(parseInt(info[1].innerHTML.toString().match('[0-9|.]+')[0]));
      task.setMemoryLimit(parseInt(info[2].innerHTML.toString().match('[0-9|.]+')[0]));
    }

    const blocks = elem.querySelectorAll('.io');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].innerHTML.replace(/&nbsp;/g, ' '), blocks[i + 1].innerHTML.replace(/&nbsp;/g, ' '));
    }

    return task.build();
  }
}
