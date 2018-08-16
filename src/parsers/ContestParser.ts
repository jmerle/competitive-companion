import { Contest } from '../models/Contest';
import { Sendable } from '../models/Sendable';
import { htmlToElement } from '../utils/dom';
import { Parser } from './Parser';

export abstract class ContestParser extends Parser {
  public abstract linkSelector: string;
  public abstract problemParser: Parser;

  public canHandlePage(): boolean {
    return document.querySelector(this.linkSelector) !== null;
  }

  public parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const links = [...elem.querySelectorAll(this.linkSelector)].map(
      el => (el as any).href,
    );
    return this.parseLinks(links);
  }

  protected parseLinks(links: string[]): Promise<Sendable> {
    return new Promise(async (resolve, reject) => {
      try {
        const bodies = await this.fetchAll(links);
        const tasks = [];

        for (let i = 0; i < bodies.length; i++) {
          const task = await this.problemParser.parse(links[i], bodies[i]);
          tasks.push(task);
        }

        resolve(new Contest(tasks));
      } catch (err) {
        reject(err);
      }
    });
  }
}
