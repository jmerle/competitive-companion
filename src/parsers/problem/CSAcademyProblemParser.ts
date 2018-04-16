import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils';
import { TaskBuilder } from '../../models/TaskBuilder';

export class CSAcademyProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://csacademy.com/*/task/*'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('h1').textContent);
      task.setGroup('CSAcademy');

      const timeLimitStr = [...elem.querySelectorAll('em')]
        .find(el => el.textContent.includes('ms'))
        .textContent;
      task.setTimeLimit(parseInt(/(\d+) ms/.exec(timeLimitStr)[1]));

      const memoryLimitStr = [...elem.querySelectorAll('em')]
        .find(el => el.textContent.includes('MB'))
        .textContent;
      task.setMemoryLimit(parseInt(/(\d+) MB/.exec(memoryLimitStr)[1]));

      elem.querySelectorAll('table tbody tr').forEach(tr => {
        const blocks = tr.querySelectorAll('pre');
        const input = blocks[0].textContent.trim();
        const output = blocks[1].textContent.trim();

        task.addTest(new Test(input, output));
      });

      resolve(task.build());
    });
  }
}
