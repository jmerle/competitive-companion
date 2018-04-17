import { Parser } from '../Parser';
import { Sendable } from '../../models/Sendable';
import { Test } from '../../models/Test';
import { htmlToElement } from '../../utils/dom';
import { TaskBuilder } from '../../models/TaskBuilder';

export class SPOJProblemParser extends Parser {
  getMatchPatterns(): string[] {
    return ['http://www.spoj.com/problems/*/'];
  }

  parse(url: string, html: string): Promise<Sendable> {
    return new Promise(resolve => {
      const elem = htmlToElement(html);
      const task = new TaskBuilder().setUrl(url);

      task.setName(elem.querySelector('#problem-name').textContent.split(' - ')[1]);

      const breadcrumb = elem.querySelector('ol.breadcrumb > li:nth-child(2)').textContent;
      task.setGroup('SPOJ - ' + breadcrumb.charAt(0).toUpperCase() + breadcrumb.slice(1));

      const blocks: Element[] = [];
      let current: Element = elem.querySelector('#problem-body').children[0];
      let isExample = false;

      while (current !== null) {
        if (isExample && current.tagName === 'PRE') {
          blocks.push(current);
        } else if (current.textContent === 'Example') {
          isExample = true;
        }

        current = current.nextElementSibling;
      }

      if (blocks.length === 1) {
        const lines = blocks[0].textContent.trim().split('\n');
        task.addTest(this.parseTestDataSingleBlock(lines));
      } else if (blocks.length === 2) {
        const lines1 = blocks[0].textContent.trim().split('\n');
        const lines2 = blocks[1].textContent.trim().split('\n');
        task.addTest(this.parseTestDataTwoBlocks(lines1, lines2));
      }

      const timeLimitStr = [...elem.querySelectorAll('#problem-meta > tbody > tr')]
        .map(el => el.textContent)
        .find(x => x.startsWith("Time limit:"))
        .trim();
      task.setTimeLimit(parseFloat(/([0-9.]+)s$/.exec(timeLimitStr)[1]) * 1000);

      const memoryLimitStr = [...elem.querySelectorAll('#problem-meta > tbody > tr')]
        .map(el => el.textContent)
        .find(x => x.startsWith("Memory limit:"));
      task.setMemoryLimit(parseInt(/Memory limit:(\d+)MB/.exec(memoryLimitStr)[1]));

      resolve(task.build());
    });
  }

  private parseTestDataSingleBlock(lines: string[]): Test {
    const inputLines: string[] = [];
    const outputLines: string[] = [];

    let isInput = false;
    let isOutput = false;

    for (let i = 0; i < lines.length; i++) {
      if (isInput) inputLines.push(lines[i]);
      if (isOutput) outputLines.push(lines[i]);

      if (!isInput && inputLines.length === 0) {
        if (lines[i].toLowerCase().includes('input')) {
          isInput = true;
        }
      }

      if (!isOutput && outputLines.length === 0) {
        if (lines[i].toLowerCase().includes('output')) {
          isInput = false;
          isOutput = true;
          inputLines.pop();
        }
      }
    }

    return new Test(inputLines.join('\n').trim(), outputLines.join('\n').trim());
  }

  private parseTestDataTwoBlocks(lines1: string[], lines2: string[]): Test {
    if (lines1[0].toLowerCase().includes('input')) {
      lines1 = lines1.slice(1);
    }

    if (lines2[0].toLowerCase().includes('output')) {
      lines2 = lines2.slice(1);
    }

    return new Test(lines1.join('\n'), lines2.join('\n'));
  }
}
