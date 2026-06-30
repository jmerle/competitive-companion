import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { fetchZip } from '../../utils/zip';
import { Parser } from '../Parser';

export class UniversalCupProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://contest.ucup.ac/contest/*/problem/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Universal Cup').setUrl(url);

    task.setName(elem.querySelector('h1.text-center').textContent.replace(/\s+/g, ' ').trim());
    task.setCategory(elem.querySelector('h1.text-left').textContent.replace(/\s+/g, ' ').trim());

    for (const badge of elem.querySelectorAll('span.badge')) {
      const text = badge.textContent.replace(/\s+/g, ' ').trim();
      const timeMatch = text.match(/^Time Limit:\s*([0-9.]+)\s*(ms|s)\b/i);
      if (timeMatch !== null) {
        const value = parseFloat(timeMatch[1]);
        task.setTimeLimit(Math.round(timeMatch[2].toLowerCase() === 'ms' ? value : value * 1000));
        continue;
      }
      const memoryMatch = text.match(/^Memory Limit:\s*([0-9.]+)\s*(MB|GB)\b/i);
      if (memoryMatch !== null) {
        const value = parseFloat(memoryMatch[1]);
        task.setMemoryLimit(Math.round(memoryMatch[2].toUpperCase() === 'GB' ? value * 1024 : value));
      }
    }

    const attachmentsUrlElem = elem.querySelector<HTMLLinkElement>('a.nav-link[href^="/download"]');
    if (attachmentsUrlElem === null) {
      return task.build();
    }

    try {
      const files = await fetchZip(attachmentsUrlElem.href, ['.in', '.ans']);

      const testCases: Record<string, { input: string; output: string }> = {};
      for (const [fileName, fileContent] of Object.entries(files)) {
        const fileNumber = fileName.match(/(\d+)/)?.[0];

        if (fileNumber) {
          testCases[fileNumber] = testCases[fileNumber] || { input: '', output: '' };
          const fileType = fileName.endsWith('.in') ? 'input' : 'output';
          testCases[fileNumber][fileType] = fileContent;
        }
      }

      Object.values(testCases).forEach(t => task.addTest(t.input, t.output, false));
    } catch (error) {
      console.error('Error extracting test cases from ZIP:', error);
    }

    return task.build();
  }
}
