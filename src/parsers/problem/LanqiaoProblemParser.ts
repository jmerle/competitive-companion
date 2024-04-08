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
    task.setName(title.replace(/\s+/g, ' ').trim());

    const limitStr = doc.querySelector('#运行限制 + table > tbody > tr').textContent;
    const [cpu, memory] = limitStr.match(/\d+/g);
    task.setTimeLimit(parseFloat(cpu) * 1000);
    task.setMemoryLimit(parseInt(memory, 10));

    // The problems on this OJ seems to have only one test case.
    // No counter-example found.
    const input = doc.querySelector('#输入样例 + pre > code, #样例输入 + pre > code').textContent;
    const output = doc.querySelector('#输出样例 + pre > code, #样例输出 + pre > code').textContent;
    task.addTest(input, output);

    return task.build();
  }
}
