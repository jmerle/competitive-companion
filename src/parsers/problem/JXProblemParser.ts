import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Parser } from '../Parser';
import { htmlToElement } from '../../utils/dom';

export class JXProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://*.7fa4.cn:8888/problem/*', 'http://*.7fa4.cn:8888/contest/*/problem/*', 'http://*.7fa4.cn:5283/problem/*', 'http://*.7fa4.cn:5283/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const doc = htmlToElement(html);
    const task = new TaskBuilder('7FA4').setUrl(url);

    // 题目名称
    const nameElem = doc.querySelector('h1.ui.header');
    const name = nameElem?.textContent?.trim() || '';
    task.setName(name);

    // 时间限制和内存限制
    const labels = doc.querySelectorAll('.row .ui.label');
    for (const label of labels) {
      const text = label.textContent || '';
      if (text.includes('时间限制')) {
        const match = text.match(/(\d+)\s*ms/);
        if (match) task.setTimeLimit(parseInt(match[1], 10));
      } else if (text.includes('内存限制')) {
        const match = text.match(/(\d+)\s*MiB/);
        if (match) task.setMemoryLimit(parseInt(match[1], 10));
      }
    }

    // 样例输入/输出（可能有多组）
    const h2s = doc.querySelectorAll('h2');
    for (let i = 0; i < h2s.length; i++) {
      const h2 = h2s[i];
      const title = h2.textContent?.trim();
      if (/样例\d*输入/.test(title)) {
        const inputDiv = h2.nextElementSibling;
        const inputCode = inputDiv?.querySelector('pre code');
        const nextH2 = h2s[i + 1];
        if (nextH2 && /样例\d*输出/.test(nextH2.textContent?.trim())) {
          const outputDiv = nextH2.nextElementSibling;
          const outputCode = outputDiv?.querySelector('pre code');
          if (inputCode && outputCode) {
            const input = inputCode.textContent?.trim() || '';
            const output = outputCode.textContent?.trim() || '';
            task.addTest(input, output);
          }
        }
      }
    }

    console.debug("7FA4 Parser: ", task);

    return task.build();
  }
}
