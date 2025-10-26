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

    const container = elem.querySelector('.scroll');

    task.setName(container.querySelector('.text-darkest.font-bold.text-lg')!.textContent!.trim());
    const categoryEl = elem.querySelector('.fixed.top-0.w-full .text-lg.ellipsis');
    task.setCategory(categoryEl ? categoryEl.textContent!.trim() : '');

    const limits = [...elem.querySelectorAll('.problemInfo_tfBoz .pc-text-raw')].map(l => l.textContent || '');

    const timeLimitStr = limits.find(text => text.includes('ms'));
    const memoryLimitStr = limits.find(text => text.includes('MB'));

    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const inputHeader = elem.querySelector('h3[id*="输入样例"]');
    const outputHeader = elem.querySelector('h3[id*="输出样例"]');

    if (inputHeader && outputHeader) {
      const inputCode = inputHeader.nextElementSibling?.querySelector('code')?.textContent?.trim();
      const outputCode = outputHeader.nextElementSibling?.querySelector('code')?.textContent?.trim();

      if (inputCode && outputCode) {
        task.addTest(inputCode, outputCode);
      }
    } else {
      const blocks = [...elem.querySelectorAll('.rendered-markdown pre > code:not(.hljs)')];

      for (let i = 0; i < blocks.length - 1; i += 2) {
        task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
      }
    }

    return task.build();
  }
}
