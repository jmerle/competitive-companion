import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeChefNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://www.codechef.com/problems/*',
      'https://www.codechef.com/*/problems/*',
      'https://www.codechef.com/submit/*',
      'https://www.codechef.com/*/submit/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CodeChef').setUrl(url);

    task.setName(
      elem.querySelector(
        ['_problem__title_', '_contestProblemTitle_', '_titleStatus__container_']
          .map(prefix => `div[class^="${prefix}"] > h1`)
          .join(', '),
      ).textContent,
    );

    const category = await this.parseCategory(url, elem);
    task.setCategory(category);

    task.setInteractive(html.includes('This is an interactive problem'));

    elem.querySelectorAll('div[class^="_input_output__table_"]').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    if (task.tests.length === 0) {
      const blocks = [...elem.querySelectorAll('pre')];
      for (let i = 0; i < blocks.length - 1; i += 2) {
        task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
      }
    }

    const timeLimitElem = elem.querySelector('div[class^="_moreInfo__container_"]');
    if (timeLimitElem !== null) {
      task.setTimeLimit(parseFloat(/([0-9.]+) secs/.exec(timeLimitElem.textContent)[1]) * 1000);
    }

    task.setMemoryLimit(256);

    return task.build();
  }

  private async parseCategory(url: string, elem: Element): Promise<string> {
    const contestIdFromPage = elem.querySelector('a[class^="_contest__link_"]');
    if (contestIdFromPage !== null) {
      return contestIdFromPage.childNodes[0].textContent.trim();
    }

    const contestIdFromUrl = /https:\/\/www\.codechef\.com\/([^/]+)\/problems\/([^/]+)/.exec(url);
    if (contestIdFromUrl !== null) {
      return contestIdFromUrl[1];
    }

    const syllabusName = elem.querySelector('div[class^="_syllabusName_"]');
    if (syllabusName !== null) {
      return syllabusName.textContent.trim();
    }

    const problemId = new URL(url).pathname.split('/').pop();
    const response = await this.fetch(`https://www.codechef.com/api/contests/PRACTICE/problems/${problemId}`);
    return JSON.parse(response).intended_contest_code || 'Practice';
  }
}
