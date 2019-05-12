import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class USACOTrainingProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://train.usaco.org/usacoprob2*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    const taskId = [...elem.querySelectorAll('h3')]
      .find(el => el.textContent.includes('PROGRAM NAME'))
      .textContent.substr(14);

    task.setInput({
      fileName: taskId + '.in',
      type: 'file',
    });

    task.setOutput({
      fileName: taskId + '.out',
      type: 'file',
    });

    task.setName(elem.querySelector('center > h1').textContent);
    task.setGroup('USACO Training');

    const input = [...elem.querySelectorAll('h3')].find(el => el.textContent.includes('SAMPLE INPUT'))
      .nextElementSibling.textContent;
    const output = [...elem.querySelectorAll('h3')].find(el => el.textContent.includes('SAMPLE OUTPUT'))
      .nextElementSibling.textContent;

    task.addTest(input, output);

    task.setTimeLimit(1000);
    task.setMemoryLimit(16);

    return task.build();
  }
}
