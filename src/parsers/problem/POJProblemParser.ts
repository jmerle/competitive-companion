import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class POJProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://poj.org/problem*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const content = elem.querySelector('body > table:last-of-type tr');

      task.setName(content.querySelector('.ptt').textContent);

      let group = ['POJ'];
      const sourceElem = [...elem.querySelectorAll('p.pst')]
        .filter(el => el.textContent === 'Source');

      if (sourceElem.length > 0) {
        const source = sourceElem[0].nextElementSibling.querySelector('a').textContent;

        if (source !== 'POJ') {
          group.push(source);
        }
      }

      task.setGroup(group.join(' - '));

      task.setTimeLimit(parseInt(/Time Limit:<\/b> (\d+)/.exec(html)[1]));
      task.setMemoryLimit(Math.floor(parseInt(/Memory Limit:<\/b> (\d+)/.exec(html)[1]) / 1000));

      const inputs = [...elem.querySelectorAll('p.pst')]
        .filter(el => el.textContent.trim().startsWith('Sample Input'))
        .map(el => el.nextElementSibling);

      const outputs = [...elem.querySelectorAll('p.pst')]
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
