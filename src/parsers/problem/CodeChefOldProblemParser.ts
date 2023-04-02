import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class CodeChefOldProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.codechef.com/problems-old/*', 'https://www.codechef.com/*/problems-old/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('CodeChef').setUrl(url);

    const name = [...elem.querySelectorAll('h1')].pop().textContent.trim().split('\n')[0];

    task.setName(name);

    const infoStr = elem.querySelector('.problem-info').textContent;

    const contestIdFromPage = /Contest Code:\s+(\S+)/.exec(infoStr);
    if (contestIdFromPage !== null) {
      task.setCategory(contestIdFromPage[1]);
    } else {
      const contestIdFromUrl = /https:\/\/www\.codechef\.com\/([^/]+)\/problems-old\/([^/]+)/.exec(url);
      if (contestIdFromUrl !== null) {
        task.setCategory(contestIdFromUrl[1]);
      } else {
        task.setCategory('Practice');
      }
    }

    task.setInteractive(html.includes('This is an interactive problem'));

    this.parseTests(html, task);

    task.setTimeLimit(parseFloat(/([0-9.]+) secs/.exec(infoStr)[1]) * 1000);
    task.setMemoryLimit(256);

    return task.build();
  }

  public parseTests(html: string, task: TaskBuilder): void {
    const elem = htmlToElement(html);

    elem.querySelectorAll('pre').forEach(pre => {
      if (pre.querySelector('b') !== null) {
        const textNodes = [...pre.childNodes].filter(x => x.nodeType === Node.TEXT_NODE);
        const codeBlocks: HTMLElement[] = [...pre.querySelectorAll('code')];

        if (codeBlocks.length >= 2) {
          this.addTest(task, codeBlocks[0].textContent, codeBlocks[1].textContent);
        } else if (textNodes.length >= 2) {
          const input = textNodes[textNodes.length - 2].textContent.trim();
          const output = textNodes[textNodes.length - 1].textContent.trim();
          this.addTest(task, input, output);
        }
      }
    });

    if (task.tests.length > 0) {
      return;
    }

    elem.querySelectorAll('.problem-statement div.mathjax-support').forEach(div => {
      const text = div.textContent.toLowerCase();
      if (!text.includes('ample input') || !text.includes('ample output')) {
        return;
      }

      const preBlocks = [...div.querySelectorAll('pre')];

      if (preBlocks.length === 2) {
        this.addTest(task, preBlocks[0].textContent, preBlocks[1].textContent);
      }
    });

    if (task.tests.length > 0) {
      return;
    }

    const exampleHeader = [...elem.querySelectorAll('h3')].filter(
      x => x.textContent.toLowerCase().includes('example:') || x.textContent.toLowerCase().includes('examples:'),
    )[0];

    const inputSamples = [...elem.querySelectorAll('h3, p, b')]
      .filter(
        x =>
          x.textContent.toLowerCase().includes('ample input') ||
          (x.textContent.toLowerCase().includes('input') &&
            exampleHeader !== undefined &&
            exampleHeader.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING),
      )
      .map(x => this.getSample(x))
      .filter(x => x !== null);

    const outputSamples = [...elem.querySelectorAll('h3, p, b')]
      .filter(
        x =>
          x.textContent.toLowerCase().includes('ample output') ||
          (x.textContent.toLowerCase().includes('output') &&
            exampleHeader !== undefined &&
            exampleHeader.compareDocumentPosition(x) & Node.DOCUMENT_POSITION_FOLLOWING),
      )
      .map(x => this.getSample(x))
      .filter(x => x !== null);

    for (let i = 0; i < inputSamples.length && i < outputSamples.length; i++) {
      this.addTest(task, inputSamples[i], outputSamples[i]);
    }
  }

  private addTest(task: TaskBuilder, input: string, output: string): void {
    if (input.startsWith('\n')) {
      input = input.trimStart();
    }

    if (output.startsWith('\n')) {
      output = output.trimStart();
    }

    task.addTest(input, output);
  }

  private getSample(sampleHeader: Element): string {
    if (sampleHeader.nextElementSibling !== null && ['PRE', 'SPAN'].includes(sampleHeader.nextElementSibling.tagName)) {
      return sampleHeader.nextElementSibling.textContent;
    }

    if (sampleHeader.nextSibling !== null && sampleHeader.nextSibling.nodeType === Node.TEXT_NODE) {
      return sampleHeader.nextSibling.textContent;
    }

    return null;
  }
}
