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

    task.setName(elem.querySelector('h1').textContent.replace(/\s+/g, ' ').trim());

    const contestUrlMatch = /\/contests\/(\d+)/.exec(url);
    if (contestUrlMatch !== null) {
      const breadcrumb = elem.querySelector(`a[data-slot="breadcrumb-link"][href="/contests/${contestUrlMatch[1]}"]`);
      if (breadcrumb !== null) {
        task.setCategory(breadcrumb.textContent.trim());
      }
    }

    for (const span of elem.querySelectorAll('span.font-mono')) {
      const text = span.textContent.replace(/\s+/g, ' ').trim();
      const timeMatch = /^([0-9.]+)\s*s$/i.exec(text);
      if (timeMatch !== null) {
        task.setTimeLimit(Math.round(parseFloat(timeMatch[1]) * 1000));
        continue;
      }
      const memoryMatch = /^([0-9.]+)\s*(MB|GB)$/i.exec(text);
      if (memoryMatch !== null) {
        const value = parseFloat(memoryMatch[1]);
        task.setMemoryLimit(Math.round(memoryMatch[2].toUpperCase() === 'GB' ? value * 1024 : value));
      }
    }

    const cards = [...elem.querySelectorAll('.rounded-lg.border')];
    const cardsByLabel = (label: string): Element[] =>
      cards.filter(c => c.querySelector('span.uppercase')?.textContent?.trim() === label);
    const inputCards = cardsByLabel('Input');
    const outputCards = cardsByLabel('Output');

    const joinPres = (card: Element): string => {
      const blocks = [...card.querySelectorAll('.sample-scroll pre')].map(p => p.textContent.replace(/\n+$/, ''));
      return blocks.length === 0 ? '' : blocks.join('\n') + '\n';
    };

    for (let i = 0; i < Math.min(inputCards.length, outputCards.length); i++) {
      task.addTest(joinPres(inputCards[i]), joinPres(outputCards[i]));
    }

    return task.build();
  }
}
