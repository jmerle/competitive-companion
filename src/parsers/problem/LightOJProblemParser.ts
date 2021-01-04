import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LightOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://lightoj.com/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('#leftSection > div > div.title > p').textContent.trim());
    task.setGroup('LightOJ');

    const input = elem.querySelector(
      '#leftSection > div > div.columns > div > div > section > div:nth-child(1) > div > div > div.card-body > div > div:nth-child(4) > div > table > tbody > tr > td:nth-child(1) > p',
    ).textContent;
    const output = elem.querySelector(
      '#leftSection > div > div.columns > div > div > section > div:nth-child(1) > div > div > div.card-body > div > div:nth-child(4) > div > table > tbody > tr > td:nth-child(2) > p',
    ).textContent;

    task.addTest(input, output);

    const timeLimitStr = elem.querySelector('#leftSection > div > p > span:nth-child(1) > span').textContent.trim();
    task.setTimeLimit(parseFloat(/([0-9.]+) second/.exec(timeLimitStr)[1]) * 1000);

    const memoryLimitStr = elem.querySelector('#leftSection > div > p > span:nth-child(2) > span').textContent.trim();
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(memoryLimitStr)[1], 10));

    return task.build();
  }
}
