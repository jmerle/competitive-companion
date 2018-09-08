import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NewGoogleCodeJamProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://codejam.withgoogle.com/*/challenges/*/dashboard',
      'https://codejam.withgoogle.com/*/challenges/*/dashboard/*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(
        elem.querySelector('.task-statement').previousElementSibling
          .textContent,
      );

      task.setGroup(
        elem.querySelector('.challenge__title').childNodes[0].textContent,
      );

      const blocks = elem.querySelectorAll(
        '.problem-io-wrapper pre.io-content',
      );

      const input = blocks[0].textContent.trim();
      const output = blocks[1].textContent.trim();
      task.addTest(input, output);

      const limits = [...elem.querySelectorAll('h3')].find(
        el => el.textContent === 'Limits',
      ).nextElementSibling.textContent;

      task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(limits)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+)GB/.exec(limits)[1], 10) * 1024);

      task.setJavaMainClass('Solution');
      task.setTestType(TestType.MultiNumber);

      resolve(task.build());
    });
  }
}
