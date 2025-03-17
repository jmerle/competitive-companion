import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class StarryCodingProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.starrycoding.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('StarryCoding').setUrl(url);

    const containerElem = elem.querySelector('.px-4.py-5');

    await task.setName(containerElem.querySelector('div').textContent.trim());

    const limitsStr = containerElem.querySelector('.el-descriptions').textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(limitsStr)[1]));
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(limitsStr)[1]));

    const blocks = containerElem.querySelectorAll('.md-editor-code-block');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }

    return task.build();
  }
}
