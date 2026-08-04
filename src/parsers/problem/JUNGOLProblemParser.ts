import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class JUNGOLProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://jungol.co.kr/problem/*', 'https://www.jungol.co.kr/problem/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/(?:www\.)?jungol\.co\.kr\/problem\/\d+\/?(?:[?#].*)?$/];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('JUNGOL').setUrl(url).setInput({ type: 'stdin' }).setOutput({ type: 'stdout' });

    const problemNumber = this.parseProblemNumber(url, elem);
    const title = this.parseTitle(elem);
    task.setName(title.length > 0 ? `${problemNumber}. ${title}` : problemNumber);

    this.parseLimits(elem, task);
    this.parseTests(elem, task);

    return task.build();
  }

  private parseProblemNumber(url: string, elem: Element): string {
    const canonicalUrl = elem.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    return /\/problem\/(\d+)/.exec(url)?.[1] ?? /\/problem\/(\d+)/.exec(canonicalUrl)?.[1] ?? '';
  }

  private parseTitle(elem: Element): string {
    const header = this.findProblemHeader(elem);
    const headerTitle = [...(header?.children ?? [])].find(
      child => child.tagName === 'SPAN' && !child.classList.contains('limit'),
    )?.textContent;

    if (headerTitle?.trim()) {
      return headerTitle.trim();
    }

    const metaTitle = elem.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '';
    return metaTitle.split(' · ')[0].trim();
  }

  private parseLimits(elem: Element, task: TaskBuilder): void {
    const limitElement = this.findProblemHeader(elem)?.querySelector('.limit');
    const limitParts = [...(limitElement?.children ?? [])].map(element => element.textContent);
    const limits = limitParts.length > 0 ? limitParts.join('\n') : (limitElement?.textContent ?? '');

    const timeMatch = /(\d+(?:\.\d+)?)\s*(ms|s)\b/i.exec(limits);
    if (timeMatch !== null) {
      const timeLimit = parseFloat(timeMatch[1]) * (timeMatch[2].toLowerCase() === 's' ? 1000 : 1);
      task.setTimeLimit(timeLimit);
    }

    const memoryMatch = /(\d+(?:\.\d+)?)\s*(KB|MB|GB)\b/i.exec(limits);
    if (memoryMatch !== null) {
      const memory = parseFloat(memoryMatch[1]);
      const unit = memoryMatch[2].toUpperCase();
      const memoryLimit = unit === 'KB' ? memory / 1024 : unit === 'GB' ? memory * 1024 : memory;
      task.setMemoryLimit(memoryLimit);
    }
  }

  private parseTests(elem: Element, task: TaskBuilder): void {
    for (const container of elem.querySelectorAll('.exampleContainer')) {
      const samples = [...container.querySelectorAll('pre')];

      for (let i = 0; i < samples.length; i += 2) {
        const input = this.parseSample(samples[i]);
        const output = i + 1 < samples.length ? this.parseSample(samples[i + 1]) : '';
        task.addTest(input, output, false);
      }
    }
  }

  private parseSample(sample: Element): string {
    const clone = sample.cloneNode(true) as Element;

    clone.querySelectorAll('[aria-hidden="true"]').forEach(element => element.remove());
    clone.querySelectorAll('br').forEach(element => element.replaceWith('\0'));

    return clone.textContent
      .replace(/\r?\n?\0/g, '\n')
      .replace(/\r\n?/g, '\n')
      .replace(/\u00a0/g, ' ');
  }

  private findProblemHeader(elem: Element): Element {
    return [...elem.querySelectorAll('h1')].find(header => header.querySelector('.limit') !== null);
  }
}
