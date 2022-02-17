import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class BUCTOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://buctcoder.com/problem.php*', 'http://182.92.175.181/problem.php*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('BUCTOJ').setUrl(url);

    let name = elem.querySelector('h1').textContent.trim();
    if (name.startsWith('问题 ')) {
      name = name.substr(3);
    }

    task.setName(name);

    const blocks = [...elem.querySelectorAll('span.copy')].map(el => el.getAttribute('data-clipboard-text'));
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i], blocks[i + 1]);
    }

    const limitsStr = elem.querySelector('.ui.center.aligned.grid > .row:nth-child(2)').textContent;
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));
    task.setTimeLimit(parseFloat(/([0-9.]+) S/.exec(limitsStr)[1]) * 1000);

    return task.build();
  }
}
