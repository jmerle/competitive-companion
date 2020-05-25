import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class HackerEarthProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/*/algorithm/*', 'https://www.hackerearth.com/*/approximate/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('HackerEarth').setUrl(url);

    const titleElem = elem.querySelector('#problem-title');
    task.setName(titleElem ? titleElem.textContent.trim() : 'Task');

    const groupSuffix: string[] =
      elem.querySelector('.timings') !== null
        ? [elem.querySelector('.cover .title').textContent.trim()]
        : [...elem.querySelectorAll('.breadcrumb a')].map(el => el.textContent).slice(1);

    const category = groupSuffix
      .map(part => part.trim())
      .filter(part => part !== '')
      .join(' - ');

    task.setCategory(category);

    elem.querySelectorAll('.input-output-container').forEach(container => {
      const blocks = container.querySelectorAll('pre');
      const input = blocks[0].textContent.trim();
      const output = blocks[1].textContent.trim();

      task.addTest(input, output);
    });

    const guidelines = elem.querySelector('.problem-guidelines').textContent;
    task.setTimeLimit(parseFloat(/([0-9.,]+) sec/.exec(guidelines)[1]) * 1000);
    task.setMemoryLimit(parseInt(/(\d+) MB/.exec(guidelines)[1], 10));

    return task.build();
  }
}
