import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class JungolProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://jungol.co.kr/problem/*', 'https://jungol.co.kr/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const taskUrl = new URL(url);
    taskUrl.searchParams.delete('cursor');

    const task = new TaskBuilder('JUNGOL').setUrl(taskUrl.toString());

    const limitElement = elem.querySelector('h1 .limit, h2 .limit');
    const titleElement = limitElement.parentElement.cloneNode(true) as Element;
    titleElement.querySelector('.limit').remove();
    titleElement.querySelectorAll('[aria-hidden="true"]').forEach(element => element.remove());
    task.setName(titleElement.textContent.trim());

    const limits = limitElement.textContent;

    task.setInteractive(
      [...elem.querySelectorAll('[aria-hidden="true"]')].some(element => element.textContent === 'component_exchange'),
    );

    const timeLimit = /timer\s*([0-9.]+)\s*(?:s|초)/.exec(limits);
    if (timeLimit !== null) {
      task.setTimeLimit(parseFloat(timeLimit[1]) * 1000);
    }

    const memoryLimit = /memory\s*(\d+)\s*MB/i.exec(limits);
    if (memoryLimit !== null) {
      task.setMemoryLimit(parseInt(memoryLimit[1], 10));
    }

    const examples = elem.querySelectorAll('.exampleContainer');
    for (const example of examples) {
      let input = '';
      let output: string = null;

      for (const block of example.querySelectorAll('main.title')) {
        const type = block.querySelector('nav [aria-hidden="true"]')?.textContent;
        const content = block.querySelector('pre');

        if (type === 'login') {
          input = this.getExampleText(content);
        } else if (type === 'logout') {
          output = this.getExampleText(content);
        }
      }

      if (output !== null) {
        task.addTest(input, output);
      }
    }

    return task.build();
  }

  private getExampleText(example: Element): string {
    const clone = example.cloneNode(true) as Element;

    clone.querySelectorAll('[aria-hidden="true"]').forEach(element => {
      if (element.textContent === 'keyboard_return') {
        let previousSibling = element.previousSibling;

        while (previousSibling !== null && previousSibling.nodeType === Node.COMMENT_NODE) {
          previousSibling = previousSibling.previousSibling;
        }

        if (
          previousSibling !== null &&
          previousSibling.nodeType === Node.TEXT_NODE &&
          /^[\r\n]+$/.test(previousSibling.textContent)
        ) {
          previousSibling.remove();
        }
      }

      element.remove();
    });
    clone.querySelectorAll('br').forEach(element => element.replaceWith('\n'));

    return clone.textContent;
  }
}
