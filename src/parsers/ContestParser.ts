import { Parser } from './Parser';
import { Sendable } from '../models/Sendable';
import { Contest } from '../models/Contest';
import { htmlToElement } from '../utils';

export abstract class ContestParser extends Parser {
  abstract problemParser: Parser;
  abstract linkSelector: string;

  canHandlePage(): boolean {
    return document.querySelector(this.linkSelector) !== null;
  }

  parse(html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const links = [...elem.querySelectorAll(this.linkSelector)].map(el => (el as any).href);
    return this.parseLinks(links);
  }

  protected parseLinks(links: string[]): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      try {
        const bodies = await this.fetchAll(links);
        const tasks = [];

        for (let i = 0; i < bodies.length; i++) {
          const task = await this.problemParser.parse(bodies[i]);
          tasks.push(task);
        }

        resolve(new Contest(tasks));
      } catch (err) {
        reject(err);
      }
    });
  }
}
