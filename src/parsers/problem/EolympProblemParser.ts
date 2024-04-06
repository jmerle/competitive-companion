import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EolympProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.eolymp.com/*/problems/*', 'https://basecamp.eolymp.com/*/problems/*'];
  }

  private mainSiteParser(elem: Element, task: TaskBuilder): Task {
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

  private basecampParser(elem: Element, task: TaskBuilder): Task {
    task.setName(elem.querySelector('.tab-content h1 span').textContent);

    const contestName = elem.querySelector('.drawer span.MuiTypography-headlineSmall')?.textContent;
    if (contestName && contestName !== task.name) {
      task.setCategory(contestName);
    }

    const [timeLimit, memoryLimit] = [...document.querySelectorAll('.tab-content span.MuiTypography-bodyMedium')].map(
      span => span.childNodes[1]?.textContent,
    );

    task.setTimeLimit(parseFloat(/\d+/.exec(timeLimit)[0]) * 1000);
    task.setMemoryLimit(parseInt(/\d+/.exec(memoryLimit)[0], 10));

    const inputOutputBlocks = [...document.querySelectorAll('.tab-content pre')];
    for (let i = 1; i < inputOutputBlocks.length; i += 2) {
      task.addTest(inputOutputBlocks[i - 1].textContent, inputOutputBlocks[i].textContent);
    }

    return task.build();
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Eolymp').setUrl(url);

    if (new URL(url).hostname.startsWith('basecamp')) {
      return this.basecampParser(elem, task);
    }

    return this.mainSiteParser(elem, task);
  }
}
