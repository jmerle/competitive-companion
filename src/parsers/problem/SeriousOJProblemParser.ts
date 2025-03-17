import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SeriousOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://judge.eluminatis-of-lu.com/p/*', 'https://judge.eluminatis-of-lu.com/contest/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SeriousOJ').setUrl(url);

    await task.setName(elem.querySelector('h1').textContent);
    task.setCategory(elem.querySelector('.location-path > a:last-of-type').textContent);

    const limitsElem = elem.querySelector('.problem-content > .section__body > blockquote');
    const limitsStr = limitsElem !== null ? limitsElem.textContent : '';

    const timeLimitMatch = /([.0-9]+) s/.exec(limitsStr);
    if (timeLimitMatch !== null) {
      task.setTimeLimit(Math.floor(parseFloat(timeLimitMatch[1]) * 1000));
    }

    const memoryLimitMatch = /([.0-9]+) MB/.exec(limitsStr);
    if (memoryLimitMatch !== null) {
      task.setMemoryLimit(Math.floor(parseFloat(memoryLimitMatch[1])));
    }

    const inputBlocks = this.getSampleBlocks(elem, 'input');
    const outputBlocks = this.getSampleBlocks(elem, 'output');
    for (let i = 0; i < inputBlocks.length && i < outputBlocks.length; i++) {
      task.addTest(inputBlocks[i], outputBlocks[i]);
    }

    return task.build();
  }

  // Sample case formats supported by this method:
  // https://judge.eluminatis-of-lu.com/p/1002
  // https://judge.eluminatis-of-lu.com/p/1003
  // https://judge.eluminatis-of-lu.com/p/1037
  // https://judge.eluminatis-of-lu.com/p/1063
  private getSampleBlocks(elem: Element, type: 'input' | 'output'): string[] {
    const blocksInTable = [...elem.querySelectorAll(`.test-case-${type} code`)].map(preElem => preElem.textContent);

    if (blocksInTable.length > 0) {
      return blocksInTable;
    }

    const precedingHeaders: Element[] = [];

    let currentElem = [...elem.querySelectorAll('.problem-content > .section__body > h1')].find(headerElem =>
      headerElem.textContent.toLowerCase().includes('ample'),
    );
    while (currentElem) {
      if (['H1', 'H2', 'H3'].includes(currentElem.tagName) && currentElem.textContent.toLowerCase().includes(type)) {
        precedingHeaders.push(currentElem);
      }

      currentElem = currentElem.nextElementSibling;
    }

    const codeBlocksFollowingHeaders = precedingHeaders
      .map(headerElem => {
        const blocks: string[] = [];

        let nextElem = headerElem.nextElementSibling;
        while (nextElem !== null && nextElem.tagName === 'DIV' && nextElem.classList.contains('code-toolbar')) {
          blocks.push(nextElem.querySelector('code').textContent);
          nextElem = nextElem.nextElementSibling;
        }

        return blocks;
      })
      .flat();

    if (codeBlocksFollowingHeaders.length > 0) {
      return codeBlocksFollowingHeaders;
    }

    return precedingHeaders
      .map(headerElem => {
        const nextElem = headerElem.nextElementSibling;
        return nextElem.tagName === 'P' ? nextElem.textContent : null;
      })
      .filter(pElem => pElem !== null);
  }
}
