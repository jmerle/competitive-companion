import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class UOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://uoj.ac/problem/*',
      'https://uoj.ac/contest/*/problem/*',
      'http://uoj.ac/problem/*',
      'http://uoj.ac/contest/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('UOJ').setUrl(url);

    const container = elem.querySelector('.uoj-content');

    const header = container.querySelector('.page-header');
    if (header.tagName === 'H1') {
      task.setName(header.textContent);
    } else {
      task.setName(header.querySelector('h1 + h1').textContent);
      task.setCategory(header.querySelector('h1 > small').textContent);
    }

    let mathTexts = [...container.querySelectorAll('script[type="math/tex"]')]
      .map(el => el.textContent)
      .filter(text => text.includes('\\texttt'));

    if (mathTexts.length === 0) {
      mathTexts = [...container.querySelectorAll('p')]
        .map(el => el.textContent)
        .filter(text => text.includes('\\texttt'));
    }

    const timeLimitStr = mathTexts.find(text => text.includes('s}'));
    task.setTimeLimit(parseFloat(/([0-9.]+)/.exec(timeLimitStr)[1]) * 1000);

    const memoryLimitStr = mathTexts.find(text => text.includes('MB}'));
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const codeBlocks = container.querySelectorAll('pre');
    for (let i = 0; i < codeBlocks.length; i += 2) {
      const input = codeBlocks[i].textContent.trim();
      const output = codeBlocks[i + 1].textContent.trim();

      task.addTest(input, output);
    }

    return task.build();
  }
}
