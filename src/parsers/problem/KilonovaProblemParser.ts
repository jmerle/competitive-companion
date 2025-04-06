import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KilonovaProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://kilonova.ro/problems/*', 'https://kilonova.ro/contests/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Kilonova').setUrl(url);

    await this.parseTitle(elem, task);
    this.parseDetails(elem, task);
    this.parseInputOutput(elem, task);
    this.parseTests(html, task);

    return task.build();
  }

  private async parseTitle(elem: Element, task: TaskBuilder): Promise<void> {
    const title = elem.querySelector('div.segment-panel > h1 > b').textContent.trim();
    if (title.indexOf(' | ') === -1) {
      await task.setName(title);

      const categoryElem = elem.querySelector('summary > h2 > a[href^="/"]');
      if (categoryElem !== null) {
        task.setCategory(categoryElem.textContent.trim());
      }
    } else {
      const [category, name] = title.split(' | ');
      await task.setName(name.trim());
      task.setCategory(category.trim());
    }
  }

  private parseDetails(elem: Element, task: TaskBuilder): void {
    const details = elem.querySelectorAll('div.w-full.mb-6.mt-2.text-center span.block');

    const timeLimitMatch = /(\d+(?:\.\d+)?)\s*s/i.exec(details[0].textContent.trim());
    const memoryLimitMatch = /(\d+)\s*MB/i.exec(details[1].textContent.trim());

    const timeLimitSeconds = parseFloat(timeLimitMatch[1]);
    const memoryLimitMB = parseInt(memoryLimitMatch[1], 10);

    task.setTimeLimit(timeLimitSeconds * 1000);
    task.setMemoryLimit(memoryLimitMB);
  }

  private parseInputOutput(elem: Element, task: TaskBuilder): void {
    const details = elem.querySelectorAll('div.w-full.mb-6.mt-2.text-center span.block');

    const isStdin = details[2]?.lastChild.nodeName === 'kn-glossary'.toUpperCase();
    const isStdout = details[3]?.lastChild.nodeName === 'kn-glossary'.toUpperCase();

    if (isStdin) {
      task.setInput({ type: 'stdin' });
    } else {
      const inputFileMatch = /:\s*(\S+)/.exec(details[2].textContent.trim());
      task.setInput({ type: 'file', fileName: inputFileMatch[1] });
    }

    if (isStdout) {
      task.setOutput({ type: 'stdout' });
    } else {
      const outputFileMatch = /:\s*(\S+)/.exec(details[3].textContent.trim());
      task.setOutput({ type: 'file', fileName: outputFileMatch[1] });
    }
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    const blocks = elem.querySelectorAll('pre code');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent, blocks[i + 1].textContent);
    }
  }
}
