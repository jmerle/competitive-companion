import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class USACOProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://www.usaco.org/current/index.php*',
      'http://www.usaco.org/index.php*',
      'http://usaco.org/current/index.php*',
      'http://usaco.org/index.php*',
    ];
  }

  public canHandlePage(): boolean {
    return window.location.search.includes('page=viewproblem');
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    const headers = elem.querySelectorAll('.panel > h2');
    task.setName(headers[1].textContent.trim());
    task.setGroup(headers[0].textContent.trim());

    task.setInput({
      fileName: /\(file (.*)\)/.exec(elem.querySelector('.prob-in-spec h4').textContent)[1],
      type: 'file',
    });

    task.setOutput({
      fileName: /\(file (.*)\)/.exec(elem.querySelector('.prob-out-spec h4').textContent)[1],
      type: 'file',
    });

    const input = elem.querySelector('pre.in').textContent;
    const output = elem.querySelector('pre.out').textContent;
    task.addTest(input, output);

    task.setTimeLimit(4000);
    task.setMemoryLimit(256);

    return task.build();
  }
}
