import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class BJTUOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://icpc.bjtu.edu.cn/problem/*',
      'https://icpc.bjtu.edu.cn/problemlist/*/problem/*',
      'https://icpc.bjtu.edu.cn/contest/*/problem/*',
      'https://citel.bjtu.edu.cn/acm/problem/*',
      'https://citel.bjtu.edu.cn/acm/contest/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('BJTU OJ').setUrl(url);

    const name = elem.querySelector('#preview-title').textContent.replace(/\s+/g, ' ').trim();
    task.setName(name);

    const timeLimitStr = elem.querySelector('#preview-time').textContent;
    const timeLimitText = elem.querySelector('#preview-time').parentElement.textContent.toLowerCase();
    const timeLimit = parseInt(timeLimitStr, 10);

    if (timeLimitText.includes('ms')) {
      task.setTimeLimit(timeLimit);
    } else {
      task.setTimeLimit(timeLimit * 1000);
    }

    const memoryLimitStr = elem.querySelector('#preview-memory').textContent;
    task.setMemoryLimit(parseInt(memoryLimitStr, 10));

    const inputs = elem.querySelectorAll('code[id^="preview-sample-in"]');
    const outputs = elem.querySelectorAll('code[id^="preview-sample-out"]');

    for (let i = 0; i < Math.min(inputs.length, outputs.length); i += 1) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }

    return task.build();
  }
}
