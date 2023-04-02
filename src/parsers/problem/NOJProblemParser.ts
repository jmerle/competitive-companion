import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://acm.njupt.edu.cn/problem/*', 'https://acm.njupt.edu.cn/contest/*/board/challenge/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('NOJ').setUrl(url);

    const container = elem.querySelector('paper-card, left-side');

    const titleNodes = container.querySelector('h1').childNodes;
    task.setName(titleNodes[titleNodes.length - 1].textContent.trim());

    const timeLimitStr = container.querySelector(
      'info-badge[title="Time Limit"], info-badge[data-original-title="Time Limit"]',
    ).textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(timeLimitStr)[1]));

    const memoryLimitStr = container.querySelector(
      'info-badge[title="Memory Limit"], info-badge[data-original-title="Memory Limit"]',
    ).textContent;
    task.setMemoryLimit(parseInt(/(\d+)K/.exec(memoryLimitStr)[1]) / 1024);

    const blocks = [...container.querySelectorAll('h2')]
      .filter(el => el.textContent.includes('ample'))
      .map(el => el.nextElementSibling)
      .map(el => (el.tagName === 'PRE' ? el : el.querySelector('pre')))
      .filter(el => el !== null);

    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].innerHTML.replace(/&nbsp;/g, ' '), blocks[i + 1].innerHTML.replace(/&nbsp;/g, ' '));
    }

    return task.build();
  }
}
