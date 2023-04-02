import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeDrillsProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://codedrills.io/problems/*', 'https://codedrills.io/contests/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CodeDrills').setUrl(url);

    task.setName(elem.querySelector('main .display-1, main .text-h5, main .title').textContent.trim());

    const breadcrumbs = elem.querySelectorAll('main .v-breadcrumbs > li');
    if (breadcrumbs.length >= 3) {
      task.setCategory(breadcrumbs[2].querySelector('a').textContent);
    }

    const headerSelector = ['h2', 'h3', 'h4'].map(elem => `main .container .v-sheet ${elem}`).join(', ');
    const headers = [...elem.querySelectorAll(headerSelector)];
    const sampleHeaderIndex = headers.findIndex(elem => elem.textContent.toLowerCase().includes('ample'));
    const testBlocks = headers
      .slice(sampleHeaderIndex)
      .filter(elem => ['input', 'output'].some(word => elem.textContent.toLowerCase().includes(word)))
      .filter(elem => !elem.textContent.toLowerCase().includes('format'))
      .map(elem => elem.nextElementSibling.querySelector('pre') || elem.nextElementSibling);

    for (let i = 0; i < testBlocks.length - 1; i += 2) {
      task.addTest(testBlocks[i].textContent, testBlocks[i + 1].textContent);
    }

    const limitsStr = elem.querySelector('main .container .v-sheet > .row:last-child').textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+) KiB/.exec(limitsStr)[1], 10) / 1024);

    return task.build();
  }
}
