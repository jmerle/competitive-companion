import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class ProbgateProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return [
      'https://probgate.org/viewproblem.php*'
    ];
  }

  public canHandlePage(): boolean {
    return true;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Probgate').setUrl(url);

    const title = elem.querySelector('.problem-title').textContent.trim();
    task.setName(title);
    task.setCategory(title);

    const headers = elem.querySelectorAll('.panel > h2');
    task.setName(headers[1].textContent.trim());
    task.setCategory(headers[0].textContent.trim());

    const inBlocks = elem.querySelectorAll('pre.example-input');
    const outBlocks = elem.querySelectorAll('pre.example-output');

    for (let i = 0; i < inBlocks.length && i < outBlocks.length; i++) {
      task.addTest(inBlocks[i].textContent, outBlocks[i].textContent);
    }

    const metaText = elem.querySelector('.problem-meta').textContent;
    const tl = Math.round(parseFloat(metaText.match(/Time Limit:\s*([\d.]+)\s*s/)[1]) * 1000);
    const ml = parseInt(metaText.match(/Memory Limit:\s*(\d+)\s*MB/)[1], 10);
    task.setTimeLimit(tl);
    task.setMemoryLimit(ml);

    return task.build();
  }
}
