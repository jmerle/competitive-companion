import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ZOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://zoj.pintia.cn/problem-sets/*/problems/\\d{1,}'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ZOJ').setUrl(url);

    const container = elem.querySelector('div[class^="problemSetContainer"]');

    await task.setName(container.querySelector('div[class^="title"]').textContent.trim());

    const limits = container.querySelectorAll('div[class*="limitations"] span');
    const timeLimitStr = limits[0].textContent;
    const memoryLimitStr = limits[2].textContent;

    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10) / 1024);

    const blocks = container.querySelectorAll('.rendered-markdown > pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
