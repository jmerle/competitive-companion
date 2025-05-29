import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EolympBasecampProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://basecamp.eolymp.com/*/problems/*', 'https://basecamp.eolymp.com/*/compete/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Eolymp').setUrl(url);

    const contentElem = elem.querySelector('.MuiContainer-root > div[class^="ui-"]');

    task.setName(contentElem.querySelector('h1 > span.ecm-span').textContent);

    const contestName = elem.querySelector('.drawer span.MuiTypography-headlineSmall')?.textContent;
    if (contestName && contestName !== task.name && contestName !== 'Basecamp') {
      task.setCategory(`Basecamp - ${contestName}`);
    } else {
      task.setCategory('Basecamp');
    }

    const [timeLimit, memoryLimit] = [...contentElem.querySelectorAll('span.MuiTypography-bodyMedium')];
    task.setTimeLimit(parseFloat(/\d+/.exec(timeLimit.textContent)[0]) * 1000);
    task.setMemoryLimit(parseInt(/\d+/.exec(memoryLimit.textContent)[0], 10));

    const inputOutputBlocks = [...contentElem.querySelectorAll('pre')];
    for (let i = 1; i < inputOutputBlocks.length; i += 2) {
      task.addTest(inputOutputBlocks[i - 1].textContent, inputOutputBlocks[i].textContent);
    }

    return task.build();
  }
}
