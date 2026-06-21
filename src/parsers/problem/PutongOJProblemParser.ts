import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class PutongOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      '*://acm.cjlu.edu.cn/problem/*',
      '*://www.acm.cjlu.edu.cn/problem/*',
      '*://acm.cjlu.edu.cn/contests/*/problem/*',
      '*://www.acm.cjlu.edu.cn/contests/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Putong OJ').setUrl(url);

    // Title format: "<pid>: <title>"
    const titleText = elem.querySelector('.proinfo-wrap h1').textContent.trim();
    task.setName(titleText.replace(/^\d+:\s*/, ''));

    // Limits are hardcoded English in <h5>: "Time Limit: Xms Memory Limit: YKB"
    const limitsText = elem.querySelector('.proinfo-wrap h5').textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(limitsText)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)KB/.exec(limitsText)[1], 10) / 1024);

    // Sample input/output in <pre><code> direct children of .proinfo-wrap
    const codeBlocks = elem.querySelectorAll('.proinfo-wrap > pre > code');
    for (let i = 0; i + 1 < codeBlocks.length; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
