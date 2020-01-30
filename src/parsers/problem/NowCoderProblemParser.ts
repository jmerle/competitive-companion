import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class NowCoderProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://ac.nowcoder.com/acm/problem/*', 'https://ac.nowcoder.com/acm/contest/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('.terminal-topic-title').textContent.trim());
    task.setGroup('NowCoder');

    const timeLimitStr = elem
      .querySelector('.question-intr > .subject-item-wrap > span')
      .textContent.split('，')
      .pop();
    task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1], 10) * 1000);

    const memoryLimitStr = elem
      .querySelector('.question-intr > .subject-item-wrap > span:nth-of-type(2)')
      .textContent.split('，')
      .pop();
    task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1], 10));

    const inputs: string[] = [];
    const outputs: string[] = [];

    const tests = elem.querySelectorAll('.question-oi-cont');
    for (let i = 0; i + 1 < tests.length; i += 2) {
      const inputText = tests[i].textContent.trim();
      const outputText = tests[i + 1].textContent.trim();
      inputs.push(inputText);
      outputs.push(outputText);
    }

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      const input = inputs[i];
      const output = outputs[i];
      task.addTest(input, output);
    }

    return task.build();
  }
}
