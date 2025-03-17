import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class YandexProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    const patterns: string[] = ['https://*.contest.yandex.com/*/contest/*/problems/*/'];

    patterns.push(...patterns.map(pattern => pattern.replace('.com', '.ru')));
    patterns.push(...patterns.map(pattern => pattern.replace('/*/contest', '/contest')));
    patterns.push(...patterns.map(pattern => pattern.replace('contest.yandex', 'contest2.yandex')));
    patterns.push(...patterns.map(pattern => pattern.replace('*.contest', 'contest')));
    patterns.push(...patterns.map(pattern => pattern.replace('/problems/*/', '/problems')));

    return patterns;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Yandex').setUrl(url);

    await task.setName(elem.querySelector('h1.title').textContent);
    task.setCategory(elem.querySelector('.contest-head__item.contest-head__item_role_title').textContent);

    const timeLimitElem = elem.querySelector('.time-limit');
    if (timeLimitElem !== null) {
      task.setTimeLimit(parseFloat(/([0-9.]+)\s/.exec(timeLimitElem.textContent)[1]) * 1000);
    }

    const memoryLimitElem = elem.querySelector('.memory-limit');
    if (memoryLimitElem !== null) {
      let memoryLimit = 0;
      try {
        const memoryLimitParsed =
          /(\d+)([MG])b/i.exec(memoryLimitElem.textContent) ?? /([0-9.]+)\s*([МГ])б/i.exec(memoryLimitElem.textContent);
        if (memoryLimitParsed !== null && memoryLimitParsed.length > 1) {
          memoryLimit = parseInt(memoryLimitParsed[1], 10);
          if (memoryLimitParsed[2] == 'G' || memoryLimitParsed[2] == 'Г') {
            memoryLimit *= 1024;
          }
        }
      } finally {
        task.setMemoryLimit(memoryLimit === 0 ? 1024 : memoryLimit);
      }
    }

    elem.querySelectorAll('.sample-tests').forEach(table => {
      const blocks = table.querySelectorAll('pre');
      task.addTest(blocks[0].textContent, blocks[1].textContent);
    });

    return task.build();
  }
}
