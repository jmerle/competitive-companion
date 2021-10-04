import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class XXMProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['http://1.14.181.192/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('XXM').setUrl(url);

    task.setName(elem.querySelector('.el-card__body>div').textContent.trim());

    const blocks: Element[] = [];
    for (const node of elem.querySelectorAll('.el-card__body>pre')) {
      blocks.push(node);
    }
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    const slimitTime = elem.querySelector('.el-tag--info').textContent;
    task.setTimeLimit(parseInt(/(\d+)ms/.exec(slimitTime)[1], 10));
    const slimitMemory = elem.querySelector('.el-tag--success').textContent;
    task.setMemoryLimit(parseInt(/(\d+)MB/.exec(slimitMemory)[1], 10));

    return task.build();
  }
}
