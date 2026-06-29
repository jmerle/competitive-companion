import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class XinYouDuiProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://xinyoudui.com/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('XinYouDui').setUrl(url);

    const nameElem = elem.querySelector('h4.ac-ant-typography');
    task.setName(nameElem.textContent.replace(/\s\s+/g, ' ').trim());

    let limits = elem.querySelectorAll("div.ac-ant-space > div.ac-ant-space-item > div > blockquote > div > div");
    let timeLimitStr = limits[0].textContent;
    task.setTimeLimit(parseInt(timeLimitStr.match(/\d+/)[0], 10));
    let memoryLimitStr = limits[1].textContent;
    task.setMemoryLimit(parseInt(memoryLimitStr.match(/\d+/)[0], 10));

    let block = elem.querySelectorAll("pre > div.ac-ant-typography");
    const len = block.length;
    if (len) {
      for (let i = 0; i < len; i += 2) {
        task.addTest(block[i].textContent, block[i + 1].textContent);
      }
    }

    return task.build();
  }
}
