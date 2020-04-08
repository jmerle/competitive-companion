import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class BaekjoonOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.acmicpc.net/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Baekjoon Online Judge').setUrl(url);

    task.setName(elem.querySelector('#problem_title').textContent);

    const constraintCells = elem.querySelectorAll('#problem-info > tbody > tr > td');
    task.setTimeLimit(parseFloat(/([0-9.]+) /.exec(constraintCells[0].textContent)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) /.exec(constraintCells[1].textContent)[1], 10));

    const inputs = elem.querySelectorAll('pre[id^="sample-input-"]');
    const outputs = elem.querySelectorAll('pre[id^="sample-output-"]');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      const input = inputs[i].textContent.trim();
      const output = outputs[i].textContent.trim();

      task.addTest(input, output);
    }

    return task.build();
  }
}
