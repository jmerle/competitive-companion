import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class YACSProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://iai.sh.cn/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Shanghai Computer Society Contest Platform').setUrl(url);

    task.setName(elem.querySelector('h2').textContent);

    const limitsStr = elem.querySelector('h2 ~ div').textContent;

    const [, timeLimit, timeLimitUnit] = /([0-9.]+)\s+?(m?s)/i.exec(limitsStr);
    task.setTimeLimit(timeLimitUnit === 's' ? parseFloat(timeLimit) * 1000 : parseFloat(timeLimit));
    task.setMemoryLimit(parseInt(/(\d+)\s+?MB/i.exec(limitsStr)[1], 10));

    const testCaseBlocks = elem.querySelectorAll('div.ExampleInput');
    testCaseBlocks.forEach(div => {
      const ioBlocks = div.querySelectorAll('textarea');
      if (ioBlocks.length >= 2) {
        task.addTest(ioBlocks[0].value, ioBlocks[1].value);
      }
    });

    return task.build();
  }
}
