import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class YandexNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://new.contest.yandex.ru/contests/*/problems*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Yandex').setUrl(url);

    task.setName(elem.querySelector('h1[class*="Problem_Problem-Header"]').textContent);

    const contestTitleElem = elem.querySelector('[class*="ContestMenu_ContestMenu-Title"] p[title]');
    if (contestTitleElem !== null) {
      task.setCategory(contestTitleElem.getAttribute('title') ?? contestTitleElem.textContent);
    }

    const timeLimitElem = elem.querySelector('tr[data-testid="time-limit"] td:last-child');
    if (timeLimitElem !== null) {
      const [valueStr, unit] = timeLimitElem.textContent.trim().split(/\s+/);
      const seconds = unit?.toLowerCase().startsWith('ms') ? parseFloat(valueStr) / 1000 : parseFloat(valueStr);
      task.setTimeLimit(Math.round(seconds * 1000));
    }

    const memoryLimitElem = elem.querySelector('tr[data-testid="memory-limit"] td:last-child');
    if (memoryLimitElem !== null) {
      const [valueStr, unit] = memoryLimitElem.textContent.trim().split(/\s+/);
      const value = parseFloat(valueStr);
      const mb = unit?.toLowerCase().startsWith('g') ? value * 1024 : value;
      task.setMemoryLimit(Math.round(mb));
    }

    elem.querySelectorAll('[class*="StatementSample_StatementSample-Content"]').forEach(sampleElem => {
      const blocks = sampleElem.querySelectorAll('pre code');
      if (blocks.length >= 2) {
        task.addTest(blocks[0].textContent, blocks[1].textContent);
      }
    });

    return task.build();
  }
}
