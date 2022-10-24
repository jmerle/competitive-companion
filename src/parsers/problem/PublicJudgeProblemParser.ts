import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class UOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://pjudge.ac/problem/*', 'https://pjudge.ac/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('PublicJudge').setUrl(url);

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
      .filter(text => text.includes('时间限制') || text.includes('空间限制'));

    if (mathTexts.length === 0) {
      mathTexts = [...container.querySelectorAll('p')]
        .map(el => el.textContent)
        .filter(text => text.includes('时间限制') || text.includes('空间限制'));
    }

    mathTexts = mathTexts.reverse();

    if (mathTexts.length >= 2) {
      const timeLimitStr = mathTexts.find(text => text.includes('时间限制'));
      task.setTimeLimit(parseFloat(/([0-9.]+)(?!.*[0-9.]+)/.exec(timeLimitStr)[1]) * 1000);

      const memoryLimitStr = mathTexts.find(text => text.includes('空间限制'));
      const memoryModifier = memoryLimitStr.includes('G') ? 1024 : 1;
      task.setMemoryLimit(parseInt(/(\d+)(?!.*\d+)/.exec(memoryLimitStr)[1], 10) * memoryModifier);
    }

    const codeBlocks = container.querySelectorAll('pre');
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
