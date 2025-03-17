import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SPOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://www.spoj.com/problems/*/'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SPOJ').setUrl(url);

    await task.setName('SPOJ ' + elem.querySelector('#problem-name').textContent.split(' - ')[0]);

    const breadcrumb = elem.querySelector('ol.breadcrumb > li:nth-child(2)').textContent;
    task.setCategory(breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1));

    const blocks: Element[] = [];
    let current: Element = elem.querySelector('#problem-body').children[0];
    let isExample = false;

    while (current !== null) {
      if (isExample && current.tagName === 'PRE') {
        blocks.push(current);
      } else if (current.textContent === 'Example' || current.textContent === 'Example Input') {
        isExample = true;
      }

      current = current.nextElementSibling;
    }

    if (blocks.length === 1) {
      const [input, output] = this.parseTestDataSingleBlock(blocks[0]);
      task.addTest(input, output);
    } else {
      for (let i = 0; i < blocks.length - 1; i += 2) {
        const lines1 = blocks[i].textContent.trim().split('\n');
        const lines2 = blocks[i + 1].textContent.trim().split('\n');
        const [input, output] = this.parseTestDataTwoBlocks(lines1, lines2);
        task.addTest(input, output);
      }
    }

    const timeElems = elem.querySelectorAll('#problem-meta > tbody > tr');
    const timeLimitStr = [...timeElems]
      .map(el => el.textContent)
      .find(x => x.startsWith('Time limit:'))
      .trim();

    task.setTimeLimit(parseFloat(/([0-9.]+)s$/.exec(timeLimitStr)[1]) * 1000);

    const memoryElems = elem.querySelectorAll('#problem-meta > tbody > tr');
    const memoryLimitStr = [...memoryElems].map(el => el.textContent).find(x => x.startsWith('Memory limit:'));

    task.setMemoryLimit(parseInt(/Memory limit:(\d+)MB/.exec(memoryLimitStr)[1], 10));

    return task.build();
  }

  private parseTestDataSingleBlock(block: Element): [string, string] {
    const root = block.childNodes.length === 1 ? block.childNodes[0] : block;
    const nodes = root.nodeType === Node.TEXT_NODE ? [root] : root.childNodes;

    const lines: string[] = [];
    for (const node of nodes) {
      if (node.nodeType === Node.ELEMENT_NODE || node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent;

        if (text.trim() === '') {
          continue;
        }

        lines.push(...text.split('\n'));
      }
    }

    const inputLines: string[] = [];
    const outputLines: string[] = [];

    let isInput = false;
    let isOutput = false;

    for (const line of lines) {
      if (!isInput && inputLines.length === 0) {
        if (line.endsWith(':') && line.toLowerCase().includes('input')) {
          isInput = true;
          continue;
        }
      }

      if (!isOutput && outputLines.length === 0) {
        if (line.endsWith(':') && line.toLowerCase().includes('output')) {
          isInput = false;
          isOutput = true;
          continue;
        }
      }

      if (isInput) {
        inputLines.push(line.trim());
      }

      if (isOutput) {
        outputLines.push(line.trim());
      }
    }

    return [inputLines.join('\n').trim(), outputLines.join('\n').trim()];
  }

  private parseTestDataTwoBlocks(lines1: string[], lines2: string[]): [string, string] {
    if (lines1[0].toLowerCase().includes('input')) {
      lines1 = lines1.slice(1);
    }

    if (lines2[0].toLowerCase().includes('output')) {
      lines2 = lines2.slice(1);
    }

    return [lines1.join('\n'), lines2.join('\n')];
  }
}
