import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class LibreOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://loj.ac/problem/*', 'https://loj.ac/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('LibreOJ').setUrl(url);

    task.setName(elem.querySelector('.ui.header').textContent.trim());

    if (url.includes('contest/')) {
      task.setCategory(elem.querySelector('title').text.split('-')[1].trim());
    }

    const timeLimitStr = elem.querySelector('.row > .ui.label:nth-child(2)').textContent;
    task.setTimeLimit(parseFloat(timeLimitStr.split('：')[1]));

    const memoryLimitStr = elem.querySelector('.row > .ui.label:nth-child(1)').textContent;
    task.setMemoryLimit(parseFloat(memoryLimitStr.split('：')[1]));

    const samplesRow = [...elem.querySelectorAll('.row')].find(el => {
      const titleElem = el.querySelector('h4');
      return titleElem !== null && titleElem.textContent === '样例';
    });

    if (samplesRow) {
      const sampleBlocks = samplesRow.querySelectorAll('pre > code');
      for (let i = 0; i < sampleBlocks.length - 1; i += 2) {
        const input = sampleBlocks[i].textContent.trim();
        const output = sampleBlocks[i + 1].textContent.trim();

        task.addTest(input, output);
      }
    }

    return task.build();
  }
}
