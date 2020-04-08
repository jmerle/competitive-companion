import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SSOIERProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://ybt.ssoier.cn/problem_show.php*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SSOIER').setUrl(url);

    const container = elem.querySelector('td.pcontent');

    task.setName(container.querySelector('h3').textContent);

    const limitsStr = container.querySelector('font').textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(Math.floor(parseInt(/(\d+) KB/.exec(limitsStr)[1], 10) / 1000));

    const codeBlocks = container.querySelectorAll('pre');
    for (let i = 0; i < codeBlocks.length; i += 2) {
      const input = codeBlocks[i].textContent.trim();
      const output = codeBlocks[i + 1].textContent.trim();

      task.addTest(input, output);
    }

    return task.build();
  }
}
