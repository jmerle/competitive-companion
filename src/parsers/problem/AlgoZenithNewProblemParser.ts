import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgoZenithNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://maang.in/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AlgoZenith').setUrl(url);

    const titleElem = elem.querySelector('h4.font-rubik');
    task.setName(titleElem.textContent.trim());

    // Match on text, the only styling hooks are Tailwind utility classes
    for (const limitElem of titleElem.parentElement.parentElement.querySelectorAll('span, p')) {
      const [, value, unit] = /^(\d+(?:\.\d+)?) (sec|MB)$/.exec(limitElem.textContent.trim()) || [];

      // The page shows 0 MB when the limit is unknown
      if (Number(value) > 0) {
        if (unit === 'sec') {
          task.setTimeLimit(Number(value) * 1000);
        } else {
          task.setMemoryLimit(Number(value));
        }
      }
    }

    const blocks = [...elem.querySelectorAll('h5')]
      .filter(heading => /^Sample (Input|Output) \d+$/.test(heading.textContent.trim()))
      .map(heading => heading.parentElement.nextElementSibling);
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].firstElementChild.textContent, blocks[i + 1].firstElementChild.textContent);
    }

    return task.build();
  }
}
