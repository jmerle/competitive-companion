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

    task.setName(
      elem.querySelector('h1')?.textContent?.trim() ??
      elem.querySelector('h4')?.textContent?.trim() ??
      'AlgoZenith Problem',
    );

    const limitElems = elem.querySelectorAll('span.dmsans ~ span.fw-bold');

    const timeLimitStr = limitElems[0]?.textContent ?? '';
    const timeLimitMatch = /(\d+)/.exec(timeLimitStr);
    if (timeLimitMatch) {
      task.setTimeLimit(parseInt(timeLimitMatch[1]) * 1000);
    }

    const memoryLimitStr = limitElems[1]?.textContent ?? '';
    const memoryLimitMatch = /(\d+)/.exec(memoryLimitStr);
    if (memoryLimitMatch) {
      task.setMemoryLimit(parseInt(memoryLimitMatch[1]));
    }

    // AZ uses "Input" and "Desired Output" labels for test cases
    const labels = Array.from(elem.querySelectorAll('label'));
    let pendingInput: string | null = null;

    for (const label of labels) {
      const labelText = label.textContent?.trim().toLowerCase() ?? '';
      const container = label.parentElement;
      if (!container) continue;

     // value is inside nested div → pick the deepest one
      const wrapperDiv = Array.from(container.children).find(
        child => child.tagName === 'DIV',
      ) as HTMLElement | undefined;

if (!wrapperDiv) continue;

// get ALL inner divs and pick the deepest/last one
const innerDivs = wrapperDiv.querySelectorAll('div');
const valueDiv = innerDivs.length > 0
  ? innerDivs[innerDivs.length - 1]
  : wrapperDiv;

const value = valueDiv.textContent?.trim() ?? '';
      // Skip placeholder text that AlgoZenith shows before output is revealed.
      if (value.startsWith('Click on Run on Sample')) continue;
      if (value.length === 0) continue;

      if (labelText.includes('input')) {
        pendingInput = value;
      } else if (labelText.includes('desired output')) {
        // use only "Desired Output" (skip user's output)
        if (pendingInput !== null) {
          task.addTest(pendingInput, value);
          pendingInput = null;
        }
      }
    }

    if (task.tests.length === 0) {
      console.warn('AlgoZenith parser: No test cases found');
    }

    return task.build();
  }
}
