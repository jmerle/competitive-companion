import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { TestType } from '../../models/TestType';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class OldGoogleCodeJamContestParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://code.google.com/codejam/contest/*/dashboard*',
      'https://codejam.withgoogle.com/codejam/contest/*/dashboard*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const tasks: Task[] = [];

    const problemCount = elem.querySelectorAll('#dsb-problem-pages > div').length;

    for (let i = 0; i < problemCount; i++) {
      const task = new TaskBuilder('Google Code Jam').setUrl(url);

      task.setName(
        elem
          .querySelector('#dsb-problem-title' + i)
          .textContent.trim()
          .replace('. ', ' - '),
      );

      task.setCategory(elem.querySelector('#dsb-contest-title').textContent);

      const blocks = elem.querySelectorAll(`#dsb-problem-page${i} .problem-io-wrapper pre.io-content`);
      const input = blocks[0].textContent.trim();
      const output = blocks[1].textContent.trim();
      task.addTest(input, output);

      task.setInput({
        fileName: task.name[0].toLowerCase() + '.in',
        type: 'file',
      });

      task.setOutput({
        fileName: task.name[0].toLowerCase() + '.out',
        type: 'file',
      });

      task.setTestType(TestType.MultiNumber);

      task.setTimeLimit(180000);
      task.setMemoryLimit(512);

      tasks.push(task.build());
    }

    return new Contest(tasks);
  }
}
