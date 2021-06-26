import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class TLXProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://tlx.toki.id/contests/*/problems/*', 'https://tlx.toki.id/problems/*/*'];
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

    const breadcrumbNodes = [...elem.querySelectorAll('.bp4-breadcrumb')];

    const categoryNode = breadcrumbNodes[breadcrumbNodes.length - 2];
    task.setCategory(categoryNode.textContent);

    // Problems in the problemset don't include the letter in the title, so we add it here
    if (!task.name.includes('. ')) {
      const problemIndexNode = breadcrumbNodes[breadcrumbNodes.length - 1];
      task.setName(problemIndexNode.textContent + '. ' + task.name);
    }

    const limitNodes = elem.querySelector('.programming-problem-statement__limits');

    const timeLimitStr = limitNodes.textContent;
    task.setTimeLimit(parseFloat(/([0-9.]+) ?s/.exec(timeLimitStr)[1]) * 1000);

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
        } else {
          return el.children[0];
        }
      });

    for (let i = 0; i < inputs.length && i < outputs.length; i++) {
      task.addTest(inputs[i].textContent, outputs[i].textContent);
    }

    return task.build();
  }
}
