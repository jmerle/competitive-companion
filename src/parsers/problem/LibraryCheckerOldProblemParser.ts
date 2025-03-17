import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LibraryCheckerOldProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://old.yosupo.jp/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Library Checker').setUrl(url);

    await task.setName(elem.querySelector('.uk-container > h1').textContent);

    task.setTimeLimit(5000);
    task.setMemoryLimit(1024);

    const preBlocks = [...elem.querySelectorAll('pre')].filter(block => block.querySelector('code') === null);
    for (let i = 0; i < preBlocks.length - 1; i += 2) {
      task.addTest(preBlocks[i].textContent, preBlocks[i + 1].textContent);
    }

    return task.build();
  }
}
