import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class AtCoderProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://*.contest.atcoder.jp/tasks/*',
      'https://beta.atcoder.jp/contests/*/tasks/*',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('h2, .h2').textContent);
      task.setGroup(elem.querySelector('.contest-name, .contest-title').textContent);

      const limitNodes = elem.querySelector('h2, .h2').nextElementSibling.nextElementSibling.childNodes;
      task.setTimeLimit(parseFloat(/([0-9.]+) ?sec/.exec(limitNodes[limitNodes.length === 1 ? 0 : 1].textContent)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+) ?MB/.exec(limitNodes[limitNodes.length === 1 ? 0 : 3].textContent)[1]));

      const inputs = [...elem.querySelectorAll('h3')]
        .filter(el => el.textContent.includes('Sample Input'))
        .map(el => el.nextElementSibling.tagName === 'DIV' ? el.nextElementSibling.nextElementSibling : el.nextElementSibling);

      const outputs = [...elem.querySelectorAll('h3')]
        .filter(el => el.textContent.includes('Sample Output'))
        .map(el => el.nextElementSibling.tagName === 'DIV' ? el.nextElementSibling.nextElementSibling : el.nextElementSibling);

      for (let i = 0; i < inputs.length; i++) {
        const input = inputs[i].textContent;
        const output = outputs[i].textContent;

        task.addTest(input, output);
      }

      resolve(task.build());
    });
  }
}
