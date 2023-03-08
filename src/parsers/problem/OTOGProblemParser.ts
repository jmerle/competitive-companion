import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class OTOGProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://otog.cf/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('OTOG').setUrl(url);

    const problemName = elem.querySelector('#problem-name').textContent;
    task.setName(problemName);

    const memoryLimit = Number(elem.querySelector('#memory-limit').textContent);
    task.setMemoryLimit(memoryLimit);

    const timeLimit = Number(elem.querySelector('#time-limit').textContent);
    task.setTimeLimit(timeLimit * 1000);

    const inputs = elem.querySelectorAll('#input');
    const outputs = elem.querySelectorAll('#output');

    inputs.forEach((inputElement, i) => {
      const outputElement = outputs[i];
      const input = inputElement.textContent;
      const output = outputElement.textContent;
      task.addTest(input, output);
    });

    return task.build();
  }
}
