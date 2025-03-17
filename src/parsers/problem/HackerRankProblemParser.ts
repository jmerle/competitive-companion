import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HackerRankProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.hackerrank.com/challenges/*/problem*', 'https://www.hackerrank.com/contests/*/challenges/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HackerRank').setUrl(url);

    await task.setName(elem.querySelector('h1.page-label, h2.hr_tour-challenge-name').textContent.trim());

    const breadCrumbsSelector = '.breadcrumb-item-text, #breadcrumb [itemprop="item"] > span';
    const breadCrumbs = [...elem.querySelectorAll(breadCrumbsSelector)].map(el => el.textContent);
    task.setCategory(breadCrumbs.slice(1, -1).join(' - '));

    this.parseTests(html, task);

    task.setTimeLimit(4000);
    task.setMemoryLimit(512);

    return task.build();
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    let blocks = elem.querySelectorAll('.challenge_sample_input pre, .challenge_sample_output pre');

    if (blocks.length === 0) {
      blocks = elem.querySelectorAll('.challenge-body-html pre');
    }

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }
  }
}
