import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ACGOProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.acgo.cn/problemset/info/*', 'https://www.acgo.cn/exam/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ACGO').setUrl(url);
    const isExam = new URL(url).pathname.startsWith('/exam/');

    task.setName(elem.querySelector('h1').textContent.trim());

    const category = isExam
      ? elem.querySelector('.xm-header-name')?.textContent.trim()
      : elem.querySelector('[class*="info_source"]')?.textContent.trim();
    if (category) {
      task.setCategory(category);
    }

    const limits = isExam ? (elem.querySelector('blockquote')?.textContent ?? '') : elem.textContent;
    const time = /时间限制：\s*([\d.]+)\s*(ms|s)/i.exec(limits);
    const memory = /内存限制：\s*([\d.]+)\s*(?:Mi?B)/i.exec(limits);

    task.setTimeLimit(Number(time[1]) * (time[2].toLowerCase() === 's' ? 1000 : 1));
    task.setMemoryLimit(Number(memory[1]));

    const blocks = isExam
      ? [...elem.querySelectorAll('[class*="QPSampleBox"] > pre')]
      : [...elem.querySelectorAll('[class*="Example_exampleContent"]')];
    for (let i = 0; i + 1 < blocks.length; i += 2) {
      const input = blocks[i].textContent;
      const output = blocks[i + 1].textContent;
      if (!input.trim() || !output.trim()) {
        break;
      }
      task.addTest(input, output);
    }

    return task.build();
  }
}
