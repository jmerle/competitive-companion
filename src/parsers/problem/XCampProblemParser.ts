import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class XCampProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://contest.x-camp.org/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('X-Camp').setUrl(url);

    const nameElem = elem.querySelector('h4.contest-ant-typography');
    task.setName(nameElem.textContent.replace(/\s\s+/g, ' ').trim());

    const blocks = [...elem.querySelectorAll('.contest-ant-typography-copy')].map(elem => elem.parentElement);

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
