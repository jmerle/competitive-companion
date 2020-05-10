import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AizuOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://onlinejudge.u-aizu.ac.jp/challenges/sources/*/*/*',
      'https://onlinejudge.u-aizu.ac.jp/courses/lesson/*/*/*/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Aizu Online Judge').setUrl(url);

    task.setName(elem.querySelector('.problemBody > h1').textContent);

    const category = elem.querySelector('.breadcrumbs > .wrapper > ul > li:nth-child(3)').textContent.trim();
    task.setCategory(category[0].toUpperCase() + category.substr(1));

    const elTags = elem.querySelectorAll('.problemInfo > .el-tag');
    const timeLimitStr = elTags[0].textContent.split(' ')[0];
    const memoryLimitStr = elTags[1].textContent.split(' ')[0];

    task.setTimeLimit(parseInt(timeLimitStr, 10) * 1000);
    task.setMemoryLimit(Math.floor(parseInt(memoryLimitStr, 10) / 1000));

    const preBlocks = [...elem.querySelectorAll('pre')].filter(block => {
      const previousElem = block.previousElementSibling;

      if (previousElem === null || previousElem.tagName !== 'H3') {
        return false;
      }

      return ['入力例', '出力例', 'Sample Input', 'Sample Output'].some(x => previousElem.textContent.includes(x));
    });

    for (let i = 0; i < preBlocks.length - 1; i += 2) {
      const input = preBlocks[i].textContent.trim();
      const output = preBlocks[i + 1].textContent.trim();

      task.addTest(input, output);
    }

    return task.build();
  }
}
