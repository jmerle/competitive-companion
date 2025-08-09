import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class TLXProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://tlx.toki.id/contests/*/problems/*',
      'https://tlx.toki.id/problems/*/*',
      'https://tlx.toki.id/courses/basic*/chapters/*/problems/*',
      'https://tlx.toki.id/courses/competitive*/chapters/*/problems/*',
    ];
  }

  public parseTests(task: TaskBuilder, elem: Element): void {
    const inputs = [...elem.querySelectorAll('h3')]
      .filter(el => el.textContent.includes('Sample Input') || el.textContent.includes('Contoh Masukan'))
      .map(el => el.nextElementSibling)
      .map(el => {
        if (el.tagName === 'PRE') {
          return el;
        } else if (el.tagName === 'DIV') {
          return el.nextElementSibling;
        } else if (el.children.length >= 3) {
          return el.children[2];
        } else {
          return el.children[0];
        }
      });

    const outputs = [...elem.querySelectorAll('h3')]
      .filter(el => el.textContent.includes('Sample Output') || el.textContent.includes('Contoh Keluaran'))
      .map(el => el.nextElementSibling)
      .map(el => {
        if (el.tagName === 'PRE') {
          return el;
        } else if (el.tagName === 'DIV') {
          return el.nextElementSibling;
        } else if (el.children.length >= 3) {
          return el.children[2];
        } else if (el.children.length >= 1) {
          return el.children[0];
        } else {
          return { textContent: '' };
        }
      });

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('TLX').setUrl(url);

    const name = [...elem.querySelector('.chapter-problem-page__title > h3').childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join('')
      .trim();
    task.setName(name);

    const categoryElem = elem.querySelector(
      '.single-problemset-problem-routes__title--link, .single-contest-routes__header > .single-contest-routes__heading > h2',
    );

    if (categoryElem != null) {
      task.setCategory(categoryElem.textContent);
    } else {
      const breadcrumbs = elem.querySelectorAll('.chapter-problem-page__title--link');
      if (breadcrumbs.length > 0) {
        task.setCategory(
          [...breadcrumbs]
            .map(el => el.textContent)
            .filter(v => v.length > 0)
            .join(' - '),
        );
      }
    }

    // Problems in the problemset don't include the letter in the title, so we add it here
    if (!task.name.includes('. ')) {
      const breadcrumbText = elem.querySelector('.single-problemset-problem-routes__title').textContent;
      task.setName(breadcrumbText[breadcrumbText.length - 1] + '. ' + task.name);
    }

    const limitNodes = elem.querySelector('.statement-header__limits');

    const [, timeLimit, timeLimitUnit] = /([0-9.]+) ?(s|ms)/.exec(limitNodes.textContent);
    task.setTimeLimit(timeLimitUnit === 's' ? parseFloat(timeLimit) * 1000 : parseFloat(timeLimit));

    const memoryLimitStr = limitNodes.textContent;
    task.setMemoryLimit(parseInt(/(\d+) ?MB/.exec(memoryLimitStr)[1], 10));

    this.parseTests(task, elem);

    return task.build();
  }
}
