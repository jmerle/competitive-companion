import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class TLXProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://tlx.toki.id/contests/*/problems/*',
      'https://tlx.toki.id/problems/*/*',
      'https://tlx.toki.id/courses/basic/chapters/*/problems/*',
      'https://tlx.toki.id/courses/competitive/chapters/*/problems/*',
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('TLX').setUrl(url);

    const name = [...elem.querySelector('.programming-problem-statement__name').childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join('')
      .trim();
    task.setName(name);

    const categorySelector =
      '.single-problemset-problem-routes__title--link, .single-contest-routes__header > h2, .course-chapters-sidebar__chapters h4';
    task.setCategory(elem.querySelector(categorySelector).textContent);

    // Problems in the problemset don't include the letter in the title, so we add it here
    if (!task.name.includes('. ')) {
      const breadcrumbText = elem.querySelector('.single-problemset-problem-routes__title').textContent;
      task.setName(breadcrumbText[breadcrumbText.length - 1] + '. ' + task.name);
    }

    const limitNodes = elem.querySelector('.programming-problem-statement__limits');

    const [, timeLimit, timeLimitUnit] = /([0-9.]+) ?(s|ms)/.exec(limitNodes.textContent);
    task.setTimeLimit(timeLimitUnit === 's' ? parseFloat(timeLimit) * 1000 : parseFloat(timeLimit));

    const memoryLimitStr = limitNodes.textContent;
    task.setMemoryLimit(parseInt(/(\d+) ?MB/.exec(memoryLimitStr)[1], 10));

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

    return task.build();
  }
}
