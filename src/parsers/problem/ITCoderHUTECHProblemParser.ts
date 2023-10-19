import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ITCoderHUTECHProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://itcoder.hutech.edu.vn/p/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const doc = htmlToElement(html);
    const task = new TaskBuilder('IT Coder HUTECH').setUrl(url);

    task.setName(doc.querySelector('h2').textContent);
    task.setCategory(doc.querySelector('.title-block > h3 > a').textContent);

    const [cpu, memory] = [...document.querySelectorAll('.card-body .float-right')].map(
      el => +el.textContent.match(/\d+/),
    );
    task.setTimeLimit(cpu);
    task.setMemoryLimit(memory);

    const samples = [...document.querySelectorAll('.sample-test')];
    for (const sample of samples) {
      const input = sample.querySelector('.sample-input-text').textContent;
      const output = sample.querySelector('.sample-output-text').textContent;
      task.addTest(input, output);
    }

    return task.build();
  }
}
