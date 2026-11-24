import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class DOJProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://doj.kr/*/problems/*'];
  }

  public getExcludedMatchPatterns(): string[] {
    return ['https://doj.kr/*/problems/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('DOJ').setUrl(url);

    const title = elem.querySelector('h1.problem-title');
    if (title === null) {
      throw new Error('Problem not found, make sure you are signed in if the problem requires it');
    }

    task.setName(title.textContent.replace(/\s+/g, ' ').trim());

    // The category path looks like "DOJ / DOJ Contest / DOJ Contest 10" or "ICPC / Asia Pacific / Bangkok Regional / 2025"
    // Segments that are repeated by the segment following them are dropped
    const sourcePath = elem.querySelector('.problem-source-path');
    if (sourcePath !== null) {
      const segments = [...sourcePath.querySelectorAll('.problem-source-link')].map(el => el.textContent.trim());
      const category = segments.filter((segment, i) => i === segments.length - 1 || !segments[i + 1].includes(segment));
      if (category.length > 0) {
        task.setCategory(category.join(' '));
      }
    }

    for (const dd of elem.querySelectorAll('.judge-list dd')) {
      const text = dd.textContent.replace(/\s+/g, ' ').trim();

      const timeMatch = /^([0-9.]+) ?(ms|s)$/i.exec(text);
      if (timeMatch !== null) {
        const value = parseFloat(timeMatch[1]);
        task.setTimeLimit(Math.round(timeMatch[2].toLowerCase() === 's' ? value * 1000 : value));
        continue;
      }

      const memoryMatch = /^([0-9.]+) ?(MB|GB)$/i.exec(text);
      if (memoryMatch !== null) {
        const value = parseFloat(memoryMatch[1]);
        task.setMemoryLimit(Math.round(memoryMatch[2].toUpperCase() === 'GB' ? value * 1024 : value));
      }
    }

    for (const pair of elem.querySelectorAll('.sample-pair')) {
      const blocks = pair.querySelectorAll('.code-block');
      if (blocks.length >= 2) {
        task.addTest(blocks[0].textContent, blocks[1].textContent);
      }
    }

    return task.build();
  }
}
