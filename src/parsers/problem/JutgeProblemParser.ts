import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';
import { Test } from '../../models/Test';

export class JutgeProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['https://jutge.org/problems/*'];
  }

  canHandlePage(): boolean {
    return document.querySelector('ul.nav.nav-tabs > li:nth-child(2).active') !== null;
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('h1.my-trim').childNodes[2].textContent.trim());
      task.setGroup('Jutge');

      const blocks = elem.querySelectorAll('.list-group-item pre');
      for (let i = 0; i < blocks.length; i += 4) {
        const input = blocks[i].textContent;
        const output = blocks[i + 1].textContent;

        task.addTest(new Test(input, output));
      }

      task.setTimeLimit(1000);
      task.setMemoryLimit(1024);

      resolve(task.build());
    });
  }
}
