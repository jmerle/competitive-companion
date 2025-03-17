import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HihoCoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://hihocoder.com/problemset/problem/*', 'https://hihocoder.com/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('hihoCoder').setUrl(url);

    const main = elem.querySelector('#main > .panel');

    await task.setName(main.querySelector('h3').textContent.replace(':', '-'));

    if (elem.querySelector('.tl-site-header-title')) {
      task.setCategory(elem.querySelector('.tl-site-header-title > h3').childNodes[0].textContent.trim());
    }

    const limits = main.querySelector('.limit').textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(limits)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+)MB/.exec(limits)[1], 10));

    const blocks = main.querySelectorAll('pre');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
