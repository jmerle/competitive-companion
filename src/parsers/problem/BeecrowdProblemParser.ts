import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { requestInBackground } from '../../utils/request';
import { Parser } from '../Parser';

export class BeecrowdProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://judge.beecrowd.com/*/problems/view/*', 'https://judge.beecrowd.com/*/challenges/view/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('beecrowd').setUrl(url);

    if (url.includes('challenges/')) {
      const title = elem.querySelector('title').textContent.trim();
      task.setCategory(title.split(' - ')[1]);
    } else {
      task.setCategory(elem.querySelector('.main-content-wide li').textContent.trim());
    }

    if (elem.querySelector('#description-html') !== null) {
      let link;

      if (url.includes('challenges/')) {
        link = elem.querySelector<HTMLLinkElement>('ul.information > li:nth-child(2) > a').href;
      } else {
        link = elem.querySelector<HTMLLinkElement>('.full-screen').href;
      }

      html = await requestInBackground(link);
    }

    return this.parseFullscreen(task, html);
  }

  private async parseFullscreen(task: TaskBuilder, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    await task.setName(elem.querySelector('.header > h1').textContent);

    elem.querySelectorAll('table').forEach(table => {
      const columns = table.querySelectorAll('tbody > tr > td');
      task.addTest(this.getContent(columns[0]), this.getContent(columns[1]));
    });

    task.setTimeLimit(parseInt(elem.querySelector('.header > strong').textContent.split(' ')[1], 10) * 1000);
    task.setMemoryLimit(1024);

    return task.build();
  }

  private getContent(col: Element): string {
    return [...col.children]
      .map(x => {
        return x.textContent
          .split('\n')
          .map(y => y.trim())
          .join('\n')
          .trim();
      })
      .join('\n');
  }
}
