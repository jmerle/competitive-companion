import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class PEGJudgeProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://wcipeg.com/problem/*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('#descContent h2').textContent);
      task.setGroup('PEG Judge - ' + elem.querySelector('#descContent h3').textContent);

      task.setTimeLimit(parseFloat(/Time Limit:<\/b> ([0-9.]+)s/.exec(html)[1]) * 1000);
      task.setMemoryLimit(parseInt(/Memory Limit:<\/b> (\d+)/.exec(html)[1]));

      const inputs = [...elem.querySelectorAll('h3')]
        .filter(el => el.textContent.trim().startsWith('Sample Input'))
        .map(el => el.nextElementSibling);

      const outputs = [...elem.querySelectorAll('h3')]
        .filter(el => el.textContent.trim().startsWith('Sample Output'))
        .map(el => el.nextElementSibling);

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i].textContent;
        const output = outputs[i].textContent;

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
