import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class BaekjoonOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.acmicpc.net/problem/*', 'https://stack.acmicpc.net/problem/preview/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Baekjoon Online Judge').setUrl(url);

    task.setName(elem.querySelector('#problem_title').textContent);

    const constraintCells = elem.querySelectorAll('#problem-info > tbody > tr > td');

    if (/\d/.test(constraintCells[0].textContent)) {
      task.setTimeLimit(parseFloat(/([0-9.]+) /.exec(constraintCells[0].textContent)[1]) * 1000);
    } else {
      const timeLimits = [...elem.querySelectorAll('#problem-body p')]
        .map(el => el.textContent.trim())
        .filter(text => text.startsWith('시간 제한:'))
        .map(text => parseInt(/(\d+)/.exec(text)[1]) * 1000);

      if (timeLimits.length > 0) {
        task.setTimeLimit(Math.max(...timeLimits));
      }
    }

    task.setMemoryLimit(parseInt(/(\d+) /.exec(constraintCells[1].textContent)[1], 10));

    const inputs = elem.querySelectorAll('pre[id^="sample-input-"]');
    const outputs = elem.querySelectorAll('pre[id^="sample-output-"]');

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }

    return task.build();
  }
}
