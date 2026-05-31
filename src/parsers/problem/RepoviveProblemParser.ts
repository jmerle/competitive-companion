import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class RepoviveProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://repovive.com/contests/*/problems/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('Repovive').setUrl(url);

    const rawTitle = elem.querySelector('h1')?.textContent?.trim() ?? '';
    const cleanedTitle = rawTitle.replace(/^\s*[0-9A-Za-z]+\.\s*/, '').trim();
    task.setName(cleanedTitle || rawTitle || 'Unknown Problem');

    const pageTitle = elem.querySelector('title')?.textContent ?? '';
    const contestTitle = this.extractContestTitle(pageTitle);
    if (contestTitle) {
      task.setCategory(contestTitle);
    }

    const timeText = this.findLabelText(elem, 'Time:');
    if (timeText) {
      const timeMatch = /Time:\s*([0-9.]+)\s*([a-zA-Z]+)/.exec(timeText);
      if (timeMatch) {
        const value = parseFloat(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        const timeMs = unit.startsWith('ms') ? value : value * 1000;
        task.setTimeLimit(timeMs);
      }
    }

    const memoryText = this.findLabelText(elem, 'Memory:');
    if (memoryText) {
      const memoryMatch = /Memory:\s*(\d+)\s*MB/i.exec(memoryText);
      if (memoryMatch) {
        task.setMemoryLimit(parseInt(memoryMatch[1], 10));
      }
    }

    this.addSamples(elem, task);

    return task.build();
  }

  private extractContestTitle(pageTitle: string): string {
    if (!pageTitle) {
      return '';
    }

    const parts = pageTitle.split(' - ');
    if (parts.length < 2) {
      return '';
    }

    return parts[1].split(' | ')[0].trim();
  }

  private findLabelText(elem: Element, prefix: string): string | null {
    const spans = Array.from(elem.querySelectorAll('span'));
    const match = spans.find(span => span.textContent?.trim().startsWith(prefix));
    return match?.textContent?.trim() ?? null;
  }

  private addSamples(elem: Element, task: TaskBuilder): void {
    const samplesHeader = Array.from(elem.querySelectorAll('h3')).find(
      header => header.textContent?.trim() === 'Samples',
    );

    const samplesContainer = samplesHeader?.parentElement?.nextElementSibling;
    if (!samplesContainer) {
      return;
    }

    const grids = Array.from(samplesContainer.querySelectorAll('div.grid'));
    for (const grid of grids) {
      const inputPre = this.findSamplePre(grid, 'Input');
      const outputPre = this.findSamplePre(grid, 'Output');

      if (inputPre && outputPre) {
        task.addTest(inputPre.textContent ?? '', outputPre.textContent ?? '');
      }
    }
  }

  private findSamplePre(grid: Element, label: string): HTMLElement | null {
    const blocks = Array.from(grid.querySelectorAll('div.rounded-lg'));

    for (const block of blocks) {
      const labelSpan = Array.from(block.querySelectorAll('span')).find(
        span => span.textContent?.trim().toLowerCase() === label.toLowerCase(),
      );

      if (labelSpan) {
        return block.querySelector('pre');
      }
    }

    return null;
  }
}
