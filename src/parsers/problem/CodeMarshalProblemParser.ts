import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeMarshalProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://algo.codemarshal.org/problems/*', 'https://algo.codemarshal.org/contests/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    const content = elem.querySelector('#main div div');

    task.setName(content.querySelector('div.h1').textContent);
    task.setGroup('CodeMarshal');

    const scoreCpuTimeMemory = content.querySelector('p:first-of-type').textContent;

    let memory = scoreCpuTimeMemory.substr(scoreCpuTimeMemory.indexOf('Memory: ') + 'Memory: '.length);
    memory = memory.substr(0, memory.length - 2);

    const cpuTime = scoreCpuTimeMemory.substring(
      scoreCpuTimeMemory.indexOf('CPU: ') + 'CPU: '.length,
      scoreCpuTimeMemory.indexOf('Memory: ') - 1,
    );

    task.setTimeLimit(parseFloat(cpuTime) * 1000);
    task.setMemoryLimit(parseInt(memory, 10));

    const inputs = content.querySelectorAll('.sample-input');
    const outputs = content.querySelectorAll('.sample-output');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      const input = inputs[i].textContent;
      const output = outputs[i].textContent;

      task.addTest(input, output);
    }

    return task.build();
  }
}
