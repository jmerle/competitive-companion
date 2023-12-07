import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class UOJProblemParser extends Parser {
  public static readonly domains: Record<string, string> = {
    'uoj.ac': 'UOJ',
    'pjudge.ac': 'Public Judge',
    'oj.daimayuan.top': 'Daimayuan Online Judge',
  };

  public getMatchPatterns(): string[] {
    const matchPatterns = [];

    for (const domain in UOJProblemParser.domains) {
      for (const protocol of ['http', 'https']) {
        matchPatterns.push(
          `${protocol}://${domain}/problem/*`,
          `${protocol}://${domain}/contest/*/problem/*`,
          `${protocol}://${domain}/course/*/problem/*`,
        );
      }
    }

    return matchPatterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder(UOJProblemParser.domains[new URL(url).hostname]).setUrl(url);

    const container = elem.querySelector('.uoj-content');

    const header = container.querySelector('.page-header');
    if (header.tagName === 'H1') {
      task.setName(this.getTitle(header));
    } else {
      task.setName(this.getTitle(header.querySelector('h1 + h1')));
      task.setCategory(this.getTitle(header.querySelector('h1 > small')));
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

    const codeBlocks = container.querySelectorAll('pre:not(.sh_sourceCode)');
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }

  private getTitle(elem: Element): string {
    return elem.textContent.trim().replace(/\s+/g, ' ');
  }
}
