import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NewtonSchoolProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://my.newtonschool.co/playground/code/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Newton School').setUrl(url);

    await task.setName(elem.querySelector('.question-title > div').textContent.trim().split(' (')[0]);
    task.setCategory(elem.querySelector('.playground-title').textContent.trim().split(' - ')[0]);

    const limitsStr = elem.querySelector('.question-limits').textContent;
    task.setTimeLimit(parseFloat(/Time Limit: ([0-9.]+) sec/.exec(limitsStr)[1]) * 1000);
    task.setMemoryLimit(parseInt(/Memory Limit: (\d+)000 kB/.exec(limitsStr)[1], 10));

    const exampleSections = elem
      .querySelector('.example-text')
      .textContent.split('\n\n')
      .map(section => section.split('\n'));

    const inputSections = exampleSections.filter(
      section => section.length > 1 && section[0].toLowerCase().includes('ample input'),
    );

    const outputSections = exampleSections.filter(
      section => section.length > 1 && section[0].toLowerCase().includes('ample output'),
    );

    for (let i = 0; i < inputSections.length && i < outputSections.length; i++) {
      task.addTest(inputSections[i].slice(1).join('\n'), outputSections[i].slice(1).join('\n'));
    }

    return task.build();
  }
}
