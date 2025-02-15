import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeUpProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://codeup.kr/problem.php*', 'https://www.codeup.kr/problem.php*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CodeUp').setUrl(url);

    task.setName(elem.querySelector('h2').textContent);

    const limitsStr = elem.querySelector('h2 + div').textContent;
    task.setTimeLimit(Math.floor(parseFloat(/([0-9.]+) Sec/.exec(limitsStr)[1]) * 1000));
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1]));

    const inputBlock = elem.querySelector('#sinput > samp');
    if (inputBlock !== null) {
      const outputBlock = inputBlock.parentElement.parentElement.parentElement.nextElementSibling.querySelector('samp');

      task.addTest(inputBlock.textContent, outputBlock.textContent);
    }

    return task.build();
  }
}
