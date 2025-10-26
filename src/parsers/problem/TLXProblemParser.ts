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

  private setCategoryAndModifyName(task: TaskBuilder, elem: Element): void {
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
      const breadcrumbElem = elem.querySelector('.single-problemset-problem-routes__title');
      const breadcrumbTexts = Array.from(breadcrumbElem.childNodes)
        .filter(n => n.nodeType == Node.TEXT_NODE)
        .map(n => n.textContent);
      task.setName(breadcrumbTexts.at(-1).trim() + '. ' + task.name);
    }
  }

  private setLimits(task: TaskBuilder, elem: Element, selector: string): void {
    const limitNodes = elem.querySelector(selector);

    const [, timeLimit, timeLimitUnit] = /([0-9.]+) ?(m?s)/.exec(limitNodes.textContent);
    task.setTimeLimit(timeLimitUnit === 's' ? parseFloat(timeLimit) * 1000 : parseFloat(timeLimit));

    const memoryLimitStr = limitNodes.textContent;
    task.setMemoryLimit(parseInt(/(\d+) ?MB/.exec(memoryLimitStr)[1], 10));
  }

  private setProblemInfoFromCoursePage(task: TaskBuilder, elem: Element): void {
    const name = [...elem.querySelector('.chapter-problem-page__title > h3').childNodes]
      .filter(node => node.nodeType === Node.TEXT_NODE)
      .map(node => node.textContent)
      .join('')
      .trim();
    task.setName(name);

    this.setCategoryAndModifyName(task, elem);
    this.setLimits(task, elem, '.statement-header__limits');
  }

  private setProblemInfo(task: TaskBuilder, elem: Element): void {
    const nameElem = elem.querySelector('.programming-problem-statement__name');
    task.setName(nameElem.textContent);

    this.setCategoryAndModifyName(task, elem);
    this.setLimits(task, elem, '.programming-problem-statement__limits');
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('TLX').setUrl(url);

    try {
      /** safer to do it this way since this method throws very early
       * on failure and we don't want to handle every edge cases
       */
      this.setProblemInfoFromCoursePage(task, elem);
    } catch {
      this.setProblemInfo(task, elem);
    }

    this.parseTests(task, elem);

    return task.build();
  }
}
