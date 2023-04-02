import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SDUTOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'http://acm.sdut.edu.cn/onlinejudge3/problems/*',
      'http://acm.sdut.edu.cn/onlinejudge3/contests/*/problems/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SDUT OnlineJudge').setUrl(url);

    const titleNodes = elem.querySelector('.problem-content > h2').childNodes;
    task.setName(titleNodes[titleNodes.length - 1].textContent.trim());

    const limitsStr = elem.querySelector('div[class^="ant-card infoBoard___"]').textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1], 10));
    task.setMemoryLimit(parseInt(/(\d+) KiB/.exec(limitsStr)[1]) / 1024);

    const blocks = [...elem.querySelectorAll('.problem-content .anticon-copy')].map(
      el => el.parentElement.nextElementSibling,
    );
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
