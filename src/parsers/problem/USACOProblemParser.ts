import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class USACOProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://www.usaco.org/current/index.php*',
      'https://www.usaco.org/index.php*',
      'https://usaco.org/current/index.php*',
      'https://usaco.org/index.php*',
    ];
  }

  public canHandlePage(): boolean {
    return window.location.search.includes('page=viewproblem');
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('USACO').setUrl(url);

    const headers = elem.querySelectorAll('.panel > h2');
    const pid = headers[1].textContent.trim();
    const cid = headers[0].textContent.trim();

    await task.setName(pid, cid.replace(' Contest', '') + ' ' + pid.replace('Problem ', 'P'));
    task.setCategory(cid);

    const inputSpec = elem.querySelector('.prob-in-spec h4');
    const outputSpec = elem.querySelector('.prob-out-spec h4');

    if (inputSpec !== null && outputSpec !== null) {
      const filePattern = /\(file (.*)\)/;

      if (filePattern.test(inputSpec.textContent)) {
        task.setInput({
          fileName: /\(file (.*)\)/.exec(inputSpec.textContent)[1],
          type: 'file',
        });
      }

      if (filePattern.test(outputSpec.textContent)) {
        task.setOutput({
          fileName: /\(file (.*)\)/.exec(outputSpec.textContent)[1],
          type: 'file',
        });
      }
    } else {
      task.setInteractive(true);
    }

    const inBlocks = elem.querySelectorAll('pre.in');
    const outBlocks = elem.querySelectorAll('pre.out');

    for (let i = 0; i < inBlocks.length && i < outBlocks.length; i++) {
      task.addTest(inBlocks[i].textContent, outBlocks[i].textContent);
    }

    task.setTimeLimit(4000);
    task.setMemoryLimit(256);

    return task.build();
  }
}
