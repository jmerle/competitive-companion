import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CSAcademyProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://csacademy.com/*/task/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CS Academy').setUrl(url);

    await task.setName(elem.querySelector('h1').textContent.trim());
    task.setCategory(elem.querySelector('title').textContent.replace(task.name, '').trim());

    task.setInteractive(elem.querySelector('span[title="This task is interactive"]') !== null);

    const timeLimitStr = [...elem.querySelectorAll('em')].find(el => el.textContent.includes('ms')).textContent;
    task.setTimeLimit(parseInt(/(\d+) ms/.exec(timeLimitStr)[1], 10));

    const memoryLimitStr = [...elem.querySelectorAll('em')].find(el => el.textContent.includes('MB')).textContent;
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(memoryLimitStr)[1], 10));

    elem.querySelectorAll('table tbody tr').forEach(tr => {
      const blocks = tr.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    return task.build();
  }
}
