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

    const title = elem.querySelector('#content h3').textContent;
    await task.setName(title.replace(/([^ ]) {2}([^ ])/g, '$1 $2'));

    const limitsStr = elem.querySelector('#content > div').textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+)秒/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1], 10));

    elem.querySelectorAll('#content .sample').forEach(sample => {
      const preBlocks = sample.querySelectorAll('pre');
      task.addTest(preBlocks[0].textContent, preBlocks[1].textContent);
    });

    return task.build();
  }
}
