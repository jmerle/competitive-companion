import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AizuOnlineJudgeBetaProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://onlinejudge.u-aizu.ac.jp/challenges/sources/*/*/*',
      'https://onlinejudge.u-aizu.ac.jp/courses/lesson/*/*/*/*',
      'https://onlinejudge.u-aizu.ac.jp/services/room.html#*/*/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Aizu Online Judge').setUrl(url);

    if (url.includes('services/room.html')) {
      this.parseArenaCategory(task, elem);
      this.parseLimits(task, elem.querySelectorAll('#description_info > .limit'));
      this.parseBody(task, elem.querySelector('#description_html'));
    } else {
      this.parseNormalCategory(task, elem);
      this.parseLimits(task, elem.querySelectorAll('.problemInfo > .el-tag'));
      this.parseBody(task, elem.querySelector('.problemBody'));
    }

    return task.build();
  }

  private parseArenaCategory(task: TaskBuilder, elem: Element): TaskBuilder {
    task.setCategory(elem.querySelector('#header_title').textContent);
    return task;
  }

  private parseNormalCategory(task: TaskBuilder, elem: Element): TaskBuilder {
    const category = elem.querySelector('.breadcrumbs > .wrapper > ul > li:nth-child(3)').textContent.trim();
    task.setCategory(category[0].toUpperCase() + category.substr(1));
    return task;
  }

  private parseLimits(task: TaskBuilder, nodes: NodeList): TaskBuilder {
    const timeLimitStr = nodes[0].textContent.split(' ')[0];
    const memoryLimitStr = nodes[1].textContent.split(' ')[0];

    task.setTimeLimit(parseInt(timeLimitStr, 10) * 1000);
    task.setMemoryLimit(parseInt(memoryLimitStr, 10) / 1000);

    return task;
  }

  private parseBody(task: TaskBuilder, body: Element): TaskBuilder {
    task.setName(body.querySelector('h1, h2').textContent);

    const preBlocks = [...body.querySelectorAll('pre')].filter(block => {
      const previousElem = block.previousElementSibling;

      if (previousElem === null || previousElem.tagName !== 'H3') {
        return false;
      }

      return ['入力例', '出力例', 'Sample Input', 'Sample Output'].some(x => previousElem.textContent.includes(x));
    });

    for (let i = 0; i < preBlocks.length - 1; i += 2) {
      task.addTest(preBlocks[i].textContent, preBlocks[i + 1].textContent);
    }

    return task;
  }
}
