import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class USACOTrainingProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://usaco.training/usacoprob2*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('USACO').setUrl(url);

    const nameSelectors = ['center > h1', 'center > b > font'];
    const names = nameSelectors
      .map(sel => elem.querySelector(sel))
      .filter(el => el !== null)
      .map(el => el.textContent.trim());

    await task.setName(names[0] || 'Unknown');
    task.setCategory('Training');

    const taskId = [...elem.querySelectorAll('h3')]
      .find(el => el.textContent.includes('PROGRAM NAME'))
      .textContent.substr(14);

    task.setJavaMainClass(taskId);

    task.setInput({
      fileName: taskId + '.in',
      type: 'file',
    });

    task.setOutput({
      fileName: taskId + '.out',
      type: 'file',
    });

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
