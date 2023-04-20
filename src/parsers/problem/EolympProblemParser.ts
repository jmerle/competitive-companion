import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EolympProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.eolymp.com/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Eolymp').setUrl(url);

    task.setName(elem.querySelector('.eo-problem-statement h1').textContent);

    const contestName = elem.querySelector('h1.eo-title__header').textContent;
    if (contestName !== task.name) {
      task.setCategory(contestName);
    }

    task.setTimeLimit(parseFloat(elem.querySelectorAll('.eo-message__text b')[0].textContent) * 1000);
    task.setMemoryLimit(parseInt(elem.querySelectorAll('.eo-message__text b')[1].textContent, 10));

    const inputBlocks = elem.querySelectorAll('.eo-problem-example-input .eo-code');
    const outputBlocks = elem.querySelectorAll('.eo-problem-example-output .eo-code');
    for (let i = 0; i < inputBlocks.length && i < outputBlocks.length; i++) {
      task.addTest(inputBlocks[i].textContent, outputBlocks[i].textContent);
    }

    return task.build();
  }
}
