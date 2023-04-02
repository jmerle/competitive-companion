import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ContestHunterProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://noi-test.zzstep.com/contest/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ContestHunter').setUrl(url);

    task.setName(elem.querySelector('title').textContent.trim());

    const blocks = [...elem.querySelectorAll('article pre')];
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    // Local judge
    const params1 = elem.querySelectorAll('.problem-params > dd');

    // Remote judge
    const params2 = elem.querySelectorAll('.well > dd');

    if (params1.length !== 0) {
      const limitsStr = params1[0].parentElement.textContent;
      task.setTimeLimit(parseFloat(/([0-9.]+)ms/.exec(limitsStr)[1]));
      task.setMemoryLimit(parseFloat(/([0-9.]+)kB/.exec(limitsStr)[1]) / 1024);
    } else if (params2.length !== 0) {
      const limitsStr = params2[0].parentElement.textContent;
      task.setTimeLimit(parseFloat(/([0-9.]+) s/.exec(limitsStr)[1]) * 1000);
      task.setMemoryLimit(parseFloat(/([0-9.]+) MiB/.exec(limitsStr)[1]));
    }

    if (params2.length >= 1) {
      task.setCategory(params2[1].textContent.trim());
    }

    return task.build();
  }
}
