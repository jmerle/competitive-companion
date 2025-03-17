import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HITOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://acm.hit.edu.cn/problemset/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HIT Online Judge').setUrl(url);

    const main = elem.querySelector('.ant-layout-content');

    await task.setName(main.querySelector('h2').textContent);

    const mainStr = main.textContent;
    task.setTimeLimit(parseInt(/Time limit : (\d+) s/.exec(mainStr)[1], 10) * 1000);
    task.setMemoryLimit(parseInt(/Memory limit : (\d+) mb/.exec(mainStr)[1], 10));

    const input = [...main.querySelectorAll('.ant-card-head-title')]
      .find((x: Element) => x.textContent === 'Sample Input')
      .parentElement.parentElement.nextElementSibling.querySelector('pre').textContent;

    const output = [...main.querySelectorAll('.ant-card-head-title')]
      .find((x: Element) => x.textContent === 'Sample Output')
      .parentElement.parentElement.nextElementSibling.querySelector('pre').textContent;

    task.addTest(input, output);

    return task.build();
  }
}
