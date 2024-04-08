import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class EolympBasecampProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://basecamp.eolymp.com/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Eolymp').setUrl(url);

    task.setName(elem.querySelector('.tab-content h1 span').textContent);

    const contestName = elem.querySelector('.drawer span.MuiTypography-headlineSmall')?.textContent;
    if (contestName && contestName !== task.name) {
      task.setCategory(`Basecamp - ${contestName}`);
    } else {
      task.setCategory('Basecamp');
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
}
