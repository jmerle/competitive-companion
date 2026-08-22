import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SSOIERProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://ybt.ssoier.cn/problem_show.php*',
      'https://ybt.ssoier.cn/problem_show.php*',
      'http://oj.woj.ac.cn:8088/problem_show.php*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SSOIER').setUrl(url);

    /**
     * 该网站会不定期调整HTML结构，导致单一选择器容易失效。
     * 此处提供多个备选选择器，按优先级依次尝试匹配，提高鲁棒性。
     * The website changes its HTML structure from time to time,
     * so we try multiple selectors as fallbacks to keep the parser working.
     */
    const container = elem.querySelector('center table td') || elem.querySelector('body > center > table td');

    task.setName(container.querySelector('h3').textContent);

    const limitsStr = container.querySelector('font').textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+) KB/.exec(limitsStr)[1], 10) / 1000);

    const codeBlocks = container.querySelectorAll('pre');
    for (let i = 0; i < codeBlocks.length - 1; i += 2) {
      task.addTest(codeBlocks[i].textContent, codeBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
