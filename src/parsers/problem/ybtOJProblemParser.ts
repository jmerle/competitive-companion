import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ybtOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://ybt.ssoier.cn/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('ybtOJ').setUrl(url);

    task.setName(elem.querySelector('center > h3').textContent.trim());
    const limitsText = elem.querySelector('font[size="2"]').textContent;
    const timeLimitMatch = limitsText.match(/时间限制: (\d+) ms/);
    if (timeLimitMatch) {
      task.setTimeLimit(parseInt(timeLimitMatch[1]));
    }

    const memoryLimitMatch = limitsText.match(/内存限制: (\d+) KB/);
    if (memoryLimitMatch) {
      const memoryInKB = parseInt(memoryLimitMatch[1]);
      task.setMemoryLimit(memoryInKB / 1024);
    }

    const firstSamplePres = elem.querySelectorAll('font[size="3"] > pre');
    if (firstSamplePres.length >= 2) {
      const input = firstSamplePres[0].textContent;
      const output = firstSamplePres[1].textContent;
      task.addTest(input, output);
    }
    
    const remainingSampleBoxes = elem.querySelectorAll('div.xxbox');
    for (const box of remainingSampleBoxes) {
      const pres = box.querySelectorAll('pre');
      if (pres.length >= 2) {
        const input = pres[0].textContent;
        const output = pres[1].textContent;
        task.addTest(input, output);
      }
    }

    return task.build();
  }
}