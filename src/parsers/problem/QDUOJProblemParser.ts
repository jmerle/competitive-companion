import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class QDUOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://qduoj.com/problem/*',
      'https://nytdoj.com/problem/*',
      'https://qduoj.com/contest/*/problem/*',
      'https://nytdoj.com/contest/*/problem/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder(elem.querySelector('.logo > span').textContent).setUrl(url);

    const main = elem.querySelector('#problem-main');

    await task.setName(main.querySelector('.panel-title > div').textContent);

    const limitsStr = elem.querySelector('#info').textContent;
    task.setTimeLimit(parseInt(/(\d+)MS/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)MB/.exec(limitsStr)[1], 10));

    const inputs = main.querySelectorAll('.sample-input > pre');
    const outputs = main.querySelectorAll('.sample-output > pre');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }

    return task.build();
  }
}
