import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class URIOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://www.urionlinejudge.com.br/judge/*/problems/view/*',
      'https://www.urionlinejudge.com.br/judge/*/challenges/view/*',
    ];
  }

  public parse(url: string, html: string): Promise<Sendable> {
    return new Promise((resolve, reject) => {
      const elem = htmlToElement(html);

      if (elem.querySelector('#description-html') !== null) {
        const link = (elem.querySelector(
          'ul.information > li:nth-child(2) > a',
        ) as any).href;

        this.fetch(link)
          .then(data => resolve(this.parseFullscreen(url, data)))
          .catch(reject);
      } else {
        resolve(this.parseFullscreen(url, html));
      }
    });
  }

  private parseFullscreen(url: string, html: string): Sendable {
    const elem = htmlToElement(html);
    const task = new TaskBuilder().setUrl(url);

    task.setName(elem.querySelector('.header > h1').textContent);
    task.setGroup('URI Online Judge');

    elem.querySelectorAll('table').forEach(table => {
      const columns = table.querySelectorAll('tbody > tr > td');

      const input = this.getContent(columns[0]);
      const output = this.getContent(columns[1]);

      task.addTest(input, output);
    });

    task.setTimeLimit(
      parseInt(
        elem.querySelector('.header > strong').textContent.split(' ')[1],
        10,
      ) * 1000,
    );

    task.setMemoryLimit(1024);

    return task.build();
  }

  private getContent(col: Element): string {
    return [...col.children]
      .map(x => {
        return (x.textContent as string)
          .split('\n')
          .map(y => y.trim())
          .join('\n')
          .trim();
      })
      .join('\n');
  }
}
