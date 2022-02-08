import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NowCoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://ac.nowcoder.com/acm/problem/*', 'https://ac.nowcoder.com/acm/contest/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('NowCoder').setUrl(url);

    task.setName(elem.querySelector('.terminal-topic-title').textContent.trim());

    const timeLimitStr = elem.querySelector('.question-intr > .subject-item-wrap > span').textContent.split('，').pop();
    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10) * 1000);

    const memoryLimitStr = elem
      .querySelector('.question-intr > .subject-item-wrap > span:nth-of-type(2)')
      .textContent.split('，')
      .pop();
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    elem.querySelectorAll('.question-oi-bd').forEach(tests => {
      const blocks = tests.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    return task.build();
  }
}
