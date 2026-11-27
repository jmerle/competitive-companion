import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { Parser } from '../Parser';

export class SamCodingProblemParser extends Parser {
  public getMatchPatterns(): string[] {
    return ['https://samcoding.uz/problems/*/*', 'https://samcoding.uz/contests/*/problems/*'];
  }

  public getExcludedMatchPatterns(): string[] {
    return ['https://samcoding.uz/problems/*/*/*', 'https://samcoding.uz/contests/*/problems/*/*'];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const task = new TaskBuilder('SamCoding').setUrl(url);

    const title = elem.querySelector('.description > h3');
    if (title === null) {
      throw new Error('Problem not found, make sure you are signed in if the problem requires it');
    }

    task.setName(title.textContent.replace(/\s+/g, ' ').trim());

    const contestName = this.getContestName(elem, url);
    if (contestName) {
      task.setCategory(contestName);
    }

    // The limits look like "Vaqt limiti: 1000 ms" and "Xotira limiti: 128 mb", the labels depend on the site language
    const limits = (title.nextElementSibling?.textContent ?? '').replace(/\s+/g, ' ');

    const timeMatch = /([0-9.]+) ?(ms|s)\b/i.exec(limits);
    if (timeMatch !== null) {
      const value = parseFloat(timeMatch[1]);
      task.setTimeLimit(Math.round(timeMatch[2].toLowerCase() === 's' ? value * 1000 : value));
    }

    const memoryMatch = /([0-9.]+) ?(kb|mb|gb)\b/i.exec(limits);
    if (memoryMatch !== null) {
      const value = parseFloat(memoryMatch[1]);
      const unit = memoryMatch[2].toLowerCase();
      task.setMemoryLimit(Math.round(unit === 'gb' ? value * 1024 : unit === 'kb' ? value / 1024 : value));
    }

    for (const row of elem.querySelectorAll('.description table tbody tr')) {
      const blocks = row.querySelectorAll('.sample-cell pre');
      if (blocks.length >= 2) {
        task.addTest(blocks[0].textContent, blocks[1].textContent);
      }
    }

    return task.build();
  }

  private getContestName(elem: Element, url: string): string | undefined {
    const contestId = /\/(?:problems|contests)\/(\d+)\//.exec(new URL(url).pathname)?.[1];
    if (contestId === undefined) {
      return undefined;
    }

    const clean = (el: Element | null | undefined): string | undefined =>
      el?.textContent.replace(/\s+/g, ' ').trim() || undefined;

    // Archive problems have a sidebar card with the name of the contest they come from and a link to its standings
    const standingsLink = elem.querySelector(`.card-body a[href$="/contests/${contestId}/standings"]`);
    const cardName = clean(standingsLink?.closest('.card-body')?.querySelector('p'));
    if (cardName) {
      return cardName;
    }

    return clean(elem.querySelector(`.breadcrumb a[href$="/contests/${contestId}"]`));
  }
}
