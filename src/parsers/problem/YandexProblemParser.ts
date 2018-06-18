import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class YandexProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return [
      'https://*.contest.yandex.com/*/contest/*/problems/*/',
      'https://*.contest2.yandex.com/*/contest/*/problems/*/',
      'https://*.contest.yandex.ru/*/contest/*/problems/*/',
      'https://*.contest2.yandex.ru/*/contest/*/problems/*/',
    ];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('h1.title').textContent);
      task.setGroup(elem.querySelector('.contest-head__item.contest-head__item_role_title').textContent);

      const tableSource = elem.querySelector('table').textContent;
      task.setTimeLimit(parseFloat(/([0-9.]+)\ssecond/.exec(tableSource)[1]) * 1000);
      task.setMemoryLimit(parseInt(/(\d+)Mb/i.exec(tableSource)[1]));

      elem.querySelectorAll('.sample-tests').forEach(table => {
        const blocks = table.querySelectorAll('pre');
        const input = blocks[0].textContent;
        const output = blocks[1].textContent;

        task.addTest(input, output);
      });

      resolve(task.build());
    });
  }
}
