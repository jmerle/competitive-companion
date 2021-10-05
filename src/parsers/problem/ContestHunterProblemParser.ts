import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ContestHunterProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://noi-test.zzstep.com/contest/0x*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ContestHunter').setUrl(url);

    task.setName(elem.querySelector('title').textContent.trim());

    const blocks: Element[] = [];
    for (const node of elem.querySelectorAll('dd>pre')) {
      blocks.push(node);
    }
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    const params1 = elem.querySelectorAll('.problem-params>dd'); // local judge.
    const params2 = elem.querySelectorAll('.well>dd'); // remote judge.
    if (params1.length != 0) {
      const slimitTime = params1[0].textContent;
      task.setTimeLimit(parseInt(/(\d+)ms/.exec(slimitTime)[1], 10));
      const slimitMemory = params1[params1.length - 1].textContent;
      task.setMemoryLimit(parseInt(/(\d+)kB/.exec(slimitMemory)[1], 10) / 1024);
    } else {
      const slimitTime = params2[4].textContent.trim();
      task.setTimeLimit(parseInt(/(\d+) s/.exec(slimitTime)[1], 10) * 1000);
      const slimitMemory = params2[5].textContent.trim();
      task.setMemoryLimit(parseInt(/(\d+) MiB/.exec(slimitMemory)[1], 10));
    }
    task.setCategory(params2[1].textContent.trim());

    return task.build();
  }
}
