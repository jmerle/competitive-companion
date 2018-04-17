import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Test } from '../../models/Test';

export class USACOProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'http://www.usaco.org/current/index.php*',
      'http://www.usaco.org/index.php*',
      'http://usaco.org/current/index.php*',
      'http://usaco.org/index.php*',
    ];
  }

  canHandlePage(): boolean {
    return window.location.search.includes('page=viewproblem');
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      const headers = elem.querySelectorAll('.panel > h2');
      task.setName(headers[1].textContent.trim());
      task.setGroup(headers[0].textContent.trim());

      task.setInput({
        type: 'file',
        fileName: /\(file (.*)\)/.exec(elem.querySelector('.prob-in-spec h4').textContent)[1],
      });

      task.setOutput({
        type: 'file',
        fileName: /\(file (.*)\)/.exec(elem.querySelector('.prob-out-spec h4').textContent)[1],
      });

      const input = elem.querySelector('pre.in').textContent;
      const output = elem.querySelector('pre.out').textContent;
      task.addTest(new Test(input, output));

      task.setTimeLimit(4000);
      task.setMemoryLimit(256);

      resolve(task.build());
    });
  }
}
