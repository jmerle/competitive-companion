import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EldarVerseProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.eldarverse.com/problem/*', 'https://eldarverse.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('EldarVerse').setUrl(url);

    const problemContent = elem.querySelector('.problem-content');
    if (problemContent === null) {
      throw new Error('Could not find .problem-content on EldarVerse problem page');
    }

    task.setName(problemContent.querySelector('h1').textContent.trim());

    const contestLink = elem.querySelector('a[href^="/contest/"]');
    if (contestLink !== null) {
      task.setCategory(contestLink.textContent.trim());
    }

    const blocks = problemContent.querySelectorAll('pre code');
    for (let i = 0; i + 1 < blocks.length; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
