import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PTAProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pintia.cn/problem-sets/*/exam/problems/type/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('PTA').setUrl(url);

    const container = elem.querySelector('div[class^="mn"] div[class^="left"]');

    task.setName(container.querySelector('span.font-bold').textContent.trim());
    task.setCategory(elem.querySelector('.fixed.top-0.w-full .text-lg.ellipsis').textContent.trim());

    const limits = [...container.querySelectorAll('div[class*="problemInfo"] .pc-text-raw')].map(l => l.textContent);
    const timeLimitStr = limits.find(text => text.includes('MB'));
    const memoryLimitStr = limits.find(text => text.includes('ms'));

    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const blocks = [...container.querySelectorAll('.rendered-markdown > pre > code:not(.hljs)')];

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
