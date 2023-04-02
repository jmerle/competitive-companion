import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class POJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://poj.org/problem*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('POJ').setUrl(url);

    const content = elem.querySelector('body > table:last-of-type tr');

    task.setName(content.querySelector('.ptt').textContent);

    const sourceElem = [...elem.querySelectorAll('p.pst')].filter(el => el.textContent === 'Source');
    if (sourceElem.length > 0) {
      const source = sourceElem[0].nextElementSibling.querySelector('a').textContent;
      if (source !== 'POJ') {
        task.setCategory(source);
      }
    }

    task.setTimeLimit(parseInt(/Time Limit:<\/b> (\d+)/.exec(html)[1], 10));
    task.setMemoryLimit(parseInt(/Memory Limit:<\/b> (\d+)/.exec(html)[1], 10) / 1000);

    const inputs = [...elem.querySelectorAll('p.pst')]
      .filter(el => el.textContent.trim().startsWith('Sample Input'))
      .map(el => el.nextElementSibling);

    const outputs = [...elem.querySelectorAll('p.pst')]
      .filter(el => el.textContent.trim().startsWith('Sample Output'))
      .map(el => el.nextElementSibling);

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }

    return task.build();
  }
}
