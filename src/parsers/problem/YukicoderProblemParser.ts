import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class YukicoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://yukicoder.me/problems/no/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('yukicoder').setUrl(url);

    const title = elem.querySelector('#content').children[0].textContent;
    task.setName(title.replace(/([^ ]) {2}([^ ])/g, '$1 $2'));

    const limitsStr = elem.querySelector('#content > div').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+)秒/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));

    elem.querySelectorAll('#content .sample').forEach(sample => {
      const preBlocks = sample.querySelectorAll('pre');

      const input = preBlocks[0].textContent;
      const output = preBlocks[1].textContent;

      task.addTest(input, output);
    });

    return task.build();
  }
}
