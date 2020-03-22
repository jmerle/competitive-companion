import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class A2OJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://a2oj.com/p*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    const name = elem.querySelector('#page center div').childNodes[4].textContent.trim().split('. ')[1];

    task.setName(name);
    task.setGroup('A2 Online Judge');

    task.setTimeLimit(2000);
    task.setMemoryLimit(256);

    const inputs = [...elem.querySelectorAll('div')]
      .filter(el => el.textContent.trim().startsWith('Sample Input'))
      .map(el => el.nextElementSibling);

    const outputs = [...elem.querySelectorAll('div')]
      .filter(el => el.textContent.trim().startsWith('Sample Output'))
      .map(el => el.nextElementSibling);

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      const input = inputs[i].textContent
        .split('\n')
        .map(x => x.trim())
        .join('\n')
        .trim();

      const output = outputs[i].textContent
        .split('\n')
        .map(x => x.trim())
        .join('\n')
        .trim();

      task.addTest(input, output);
    }

    return task.build();
  }
}
