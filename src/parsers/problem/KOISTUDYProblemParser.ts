import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KOISTUDYProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['*://*.koistudy.net/prob_page*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('KOISTUDY').setUrl(url);

    const title = elem.querySelector('.title h1').textContent.replace(/[★☆]/g, '').trim();
    task.setName(title);

    const settings = [...elem.querySelectorAll('script')]
      .map(script => script.textContent)
      .find(content => content.includes('TL_MS') && content.includes('ML_MB'));

    task.setTimeLimit(parseInt(/const\s+TL_MS\s*=\s*(\d+)/.exec(settings)[1], 10));
    task.setMemoryLimit(parseInt(/const\s+ML_MB\s*=\s*(\d+)/.exec(settings)[1], 10));

    for (const row of elem.querySelectorAll('.sample-row')) {
      const input = row.querySelector('.input pre');
      const output = row.querySelector('.output pre');

      if (input !== null && output !== null) {
        task.addTest(input.textContent, output.textContent);
      }
    }

    return task.build();
  }
}
