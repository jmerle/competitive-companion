import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

export class USACOTrainingProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://train.usaco.org/usacoprob2*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const taskId = [...elem.querySelectorAll('h3')]
        .find(el => el.textContent.includes('PROGRAM NAME'))
        .textContent
        .substr(14);

      task.setInput({
        type: 'file',
        fileName: taskId + '.in',
      });

      task.setOutput({
        type: 'file',
        fileName: taskId + '.out',
      });

      task.setName(elem.querySelector('center > h1').textContent);
      task.setGroup('USACO Training');

      const input = [...elem.querySelectorAll('h3')]
        .find(el => el.textContent.includes('SAMPLE INPUT'))
        .nextElementSibling
        .textContent;

      const output = [...elem.querySelectorAll('h3')]
        .find(el => el.textContent.includes('SAMPLE OUTPUT'))
        .nextElementSibling
        .textContent;

      task.addTest(new Test(input, output));

      task.setTimeLimit(1000);
      task.setMemoryLimit(16);

      resolve(task.build());
    });
  }
}
