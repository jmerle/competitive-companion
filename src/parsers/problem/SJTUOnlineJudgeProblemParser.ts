import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SJTUOnlineJudgeProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['*://acm.sjtu.edu.cn/OnlineJudge/problem/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/acm\.sjtu\.edu\.cn\/OnlineJudge\/problem\/\d+\/?(?:[?#].*)?$/];
  }

  public canHandlePage(): boolean {
    return (
      document.querySelector('.title-nav__title') !== null && document.querySelector('#problem-description') !== null
    );
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SJTU Online Judge').setUrl(url);

    task.setName(elem.querySelector('.title-nav__title').textContent.replace(/\s+/g, ' ').trim());

    for (const limit of elem.querySelectorAll('#plan-summary > p')) {
      const text = limit.textContent;
      // Limits can differ between testpoints; use the largest finite limit.
      // Keep TaskBuilder defaults when a limit is absent or entirely unlimited.
      if (text.includes('时间限制')) {
        const values = [...text.matchAll(/([\d.]+)\s*ms/g)].map(match => parseFloat(match[1]));
        if (values.length > 0) task.setTimeLimit(Math.max(...values));
      } else if (text.includes('内存空间限制')) {
        const values = [...text.matchAll(/([\d.]+)\s*MiB/g)].map(match => parseFloat(match[1]));
        if (values.length > 0) task.setMemoryLimit(Math.max(...values));
      }
    }

    if (elem.querySelector('#examples')) {
      for (const example of elem.querySelectorAll('#examples > .example')) {
        const columns = example.querySelectorAll(':scope > .row > .col-md-6');
        if (columns.length !== 2) continue;

        task.addTest(
          this.getSampleText(columns[0].querySelector('pre')),
          this.getSampleText(columns[1].querySelector('pre')),
        );
      }
    } else {
      const inputs = this.getLegacySamples(elem.querySelector('#example-input'));
      const outputs = this.getLegacySamples(elem.querySelector('#example-output'));
      for (let i = 0; i < Math.max(inputs.length, outputs.length); i++) {
        task.addTest(inputs[i] ?? '', outputs[i] ?? '');
      }
    }

    return task.build();
  }

  private getLegacySamples(container: Element): string[] {
    if (!container) return [];

    const blocks = container.querySelectorAll('pre');
    if (blocks.length > 0) return [...blocks].map(block => this.getSampleText(block));

    const html = container.innerHTML.replace(/<br\s*\/?>/gi, '\n').replace(/<\/p>\s*<p[^>]*>/gi, '\n');
    return [htmlToElement(html).textContent.trim()];
  }

  private getSampleText(block: Element): string {
    // render.js appends the copy button to <pre>, outside the sample's <code>.
    return (block?.querySelector('code') ?? block)?.textContent ?? '';
  }
}
