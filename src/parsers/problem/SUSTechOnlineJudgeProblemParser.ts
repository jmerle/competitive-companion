import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SUSTechOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.sustc.edu.cn/onlinejudge/problem.php*'];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const main = elem.querySelector('.jumbotron');

      task.setName(main.querySelector('h2').textContent);
      task.setGroup('SUSTech Online Judge');

      const limitsStr = main.querySelector('center').textContent;
      task.setTimeLimit(parseFloat(/([0-9.]+) Sec/.exec(limitsStr)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10) + 512);

      const blocks = main.querySelectorAll('span.sampledata');

      for (let i = 0; i < blocks.length; i += 2) {
        const input = blocks[i].textContent.trim();
        const output = blocks[i + 1].textContent.trim();

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
