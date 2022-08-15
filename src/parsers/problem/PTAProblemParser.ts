import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PTAProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pintia.cn/problem-sets/*/problems/\\d{1,}'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('PTA').setUrl(url);

    const container = elem.querySelector('div[class^="main"] div[class^="left"]');

    task.setName(container.querySelector('span.font-bold').textContent.trim());

    const limits = container.querySelectorAll('div[class*="problemInfo"] .pc-text-raw');
    const timeLimitStr = limits[3].textContent;
    const memoryLimitStr = limits[5].textContent;

    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const blocks = container.querySelectorAll('.rendered-markdown > pre > code');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
