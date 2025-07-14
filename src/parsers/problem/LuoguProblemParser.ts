import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LuoguProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.luogu.com.cn/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Luogu').setUrl(url);

    const urls = url.split('/');
    const pid = urls[urls.length - 1];
    let shortName = '';

    if (pid.includes('contestId')) {
      const cid = /\?contestId=\d+/.exec(pid).at(0);
      shortName = 'Luogu C' + cid.replace('?contestId=', '') + ' ' + pid.replace(cid, '');
    } else {
      shortName = 'Luogu ' + pid;
    }

    if (elem.querySelector('.main-container') !== null) {
      await this.parseFromPage(shortName, task, elem);
    } else {
      await this.parseFromScript(shortName, task, elem);
    }

    return task.build();
  }

  private async parseFromPage(shortName: string, task: TaskBuilder, elem: Element): Promise<void> {
    await task.setName(elem.querySelector('h1').textContent.trim(), shortName);

    const timeLimitStr = elem.querySelector('.stat > .field:nth-child(3) > .value').textContent;
    task.setTimeLimit(parseFloat(timeLimitStr) * 1000);

    const memoryLimitStr = elem.querySelector('.stat > .field:nth-child(4) > .value').textContent;
    const memoryLimitAmount = parseFloat(memoryLimitStr.substring(0, memoryLimitStr.length - 2));
    const memoryLimitUnit = memoryLimitStr.substring(memoryLimitStr.length - 2);
    const memoryLimitConverted = memoryLimitUnit == 'MB' ? memoryLimitAmount : memoryLimitAmount * 1024;
    task.setMemoryLimit(Math.floor(memoryLimitConverted));

    elem.querySelectorAll('.io-sample').forEach(sample => {
      const blocks = sample.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });
  }

  private async parseFromScript(shortName: string, task: TaskBuilder, elem: Element): Promise<void> {
    const script = elem.querySelector('#lentille-context').textContent;
    const data = JSON.parse(script).data.problem;

    await task.setName(`${data.pid} ${data.title}`.trim(), shortName);

    task.setTimeLimit(Math.max(...data.limits.time));
    task.setMemoryLimit(Math.max(...data.limits.memory) / 1024);

    for (const sample of data.samples) {
      task.addTest(sample[0], sample[1]);
    }
  }
}
