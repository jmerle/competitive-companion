import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LanqiaoProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.lanqiao.cn/problems/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const doc = htmlToElement(html);
    const task = new TaskBuilder('Lanqiao').setUrl(url);

    const title = doc.querySelector('.course-name').textContent;
    await task.setName(title.replace(/\s+/g, ' ').trim());

    const limitStr = doc.querySelector('#运行限制').nextElementSibling.textContent;
    const [cpu, memory] = limitStr.match(/\d+/g);
    task.setTimeLimit(parseFloat(cpu) * 1000);
    task.setMemoryLimit(parseInt(memory, 10));

    const blocks = doc.querySelectorAll('pre > code');
    for (let i = blocks.length % 2 === 0 ? 0 : 1; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
