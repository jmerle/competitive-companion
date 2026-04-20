import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class AlgoZenithProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://maang.in/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('AlgoZenith').setUrl(url);

    const title = elem.querySelector('h1');
    task.setName(title?.textContent?.trim() || 'AlgoZenith Problem');

    const headings = [...elem.querySelectorAll('h5')];

    let lastInput: string | null = null;

    for (let h of headings) {
      const text = h.textContent?.toLowerCase() || '';

      const container = h.parentElement?.parentElement;

      const contentDiv = container?.querySelector(
        '.custom-scrollbar'
      );

      const content = contentDiv?.textContent?.trim() || '';

      if (text.includes('input')) {
        lastInput = content;
      } else if (text.includes('output') && lastInput !== null) {
        task.addTest(lastInput, content);
        lastInput = null;
      }
    }

    return task.build();
  }
}