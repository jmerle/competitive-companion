import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class XXMProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://1.14.181.192/problem/detail?*', 'http://1.14.181.192/studentcenter/hw/detail?*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('XXM').setUrl(url);

    await task.setName(elem.querySelector('.el-card__body > div').textContent.trim());

    const blocks = [...elem.querySelectorAll('.el-card__body > pre')];
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    const timeLimitStr = elem.querySelector('.el-tag--info').textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(timeLimitStr)[1], 10));

    const memoryLimitStr = elem.querySelector('.el-tag--success').textContent;
    task.setMemoryLimit(parseInt(/(\d+)MB/.exec(memoryLimitStr)[1], 10));

    return task.build();
  }
}
