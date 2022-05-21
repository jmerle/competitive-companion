import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LeetCodeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://leetcode.com/problems/*', 'https://leetcode.com/contests/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HackerEarth').setUrl(url);
    const titleElement = elem.querySelector('[data-cy="question-title"]');
    task.setName(titleElement ? titleElement.textContent.trim() : 'LeetCodeProblem');
    task.setCategory(elem.querySelector('[diff]').textContent.trim());
    return task.build();
  }
}
