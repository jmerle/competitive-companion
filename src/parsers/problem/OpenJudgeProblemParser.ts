import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class OpenJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://*.openjudge.cn/*/*/'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('OpenJudge').setUrl(url);

    const groupName = elem.querySelector('.contest-title-tab > h2 > a[rel="home"]').textContent;
    const contestName = elem.querySelector('.contest-title-tab > h2:nth-of-type(2)').textContent;
    task.setCategory(`${groupName} - ${contestName}`);

    await task.setName(elem.querySelector('#pageTitle > h2').textContent);

    const limitsStr = elem.querySelector('dl.problem-params').textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)kB/.exec(limitsStr)[1], 10) / 1024);

    const blocks = elem.querySelectorAll('dd > pre');
    if (blocks.length >= 2) {
      task.addTest(blocks[blocks.length - 2].textContent, blocks[blocks.length - 1].textContent);
    }

    return task.build();
  }
}
