import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgoZenithNewProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://maang.in/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AlgoZenith').setUrl(url);

    // Title
    task.setName(elem.querySelector('h1, h2, h3, h4').textContent.trim());

    // Time and Memory limits
    const limitSpans = elem.querySelectorAll('span.body-m-open-sans.text-fg-grey-secondary, span.font-open-sans.text-fg-grey-primary.font');
    let timeLimitStr = '';
    let memoryLimitStr = '';

    limitSpans.forEach(span => {
      const text = span.textContent.trim();
      if (text.includes('sec')) timeLimitStr = text;
      if (text.includes('MB')) memoryLimitStr = text;
    });

    if (timeLimitStr) {
      task.setTimeLimit(parseInt(/(\d+)/.exec(timeLimitStr)[1]) * 1000);
    }
    if (memoryLimitStr) {
      task.setMemoryLimit(parseInt(/(\d+)/.exec(memoryLimitStr)[1]));
    }

    // Sample test cases
    const blocks = elem.querySelectorAll('div.custom-scrollbar.max-h-80.overflow-auto.whitespace-pre-wrap');
    for (let i = 0; i < blocks.length - 1; i += 2) {
      task.addTest(blocks[i].textContent.trim(), blocks[i + 1].textContent.trim());
    }

    return task.build();
  }
}
