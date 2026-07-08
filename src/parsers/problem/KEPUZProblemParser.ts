import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class KEPUZProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://kep.uz/problems/*', 'https://kep.uz/contests/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('KEP.uz').setUrl(url);

    task.setName(elem.querySelector('h5').textContent.trim());

    for (const chip of elem.querySelectorAll('.MuiChip-label')) {
      const text = chip.textContent.trim();
      const timeMatch = text.match(/Time limit:\s*(\d+)\s*ms/i);
      if (timeMatch !== null) {
        task.setTimeLimit(parseInt(timeMatch[1], 10));
        continue;
      }
      const memoryMatch = text.match(/Memory limit:\s*(\d+)\s*MB/i);
      if (memoryMatch !== null) {
        task.setMemoryLimit(parseInt(memoryMatch[1], 10));
      }
    }

    const sampleHeader = [...elem.querySelectorAll('h6')].find(h => /Sample tests/i.test(h.textContent));
    if (sampleHeader !== undefined) {
      const samplesContainer = sampleHeader.nextElementSibling;
      if (samplesContainer !== null) {
        for (const card of samplesContainer.querySelectorAll(':scope > [class*="MuiPaper"]')) {
          const textBlocks = [...card.querySelectorAll('div[class*="MuiBox"]')].filter(
            box => box.children.length === 0,
          );
          if (textBlocks.length >= 2) {
            task.addTest(textBlocks[0].textContent, textBlocks[1].textContent);
          }
        }
      }
    }

    return task.build();
  }
}
