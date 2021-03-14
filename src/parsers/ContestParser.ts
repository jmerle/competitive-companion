import { Contest } from '../models/Contest';
import { Sendable } from '../models/Sendable';
import { Task } from '../models/Task';
import { htmlToElement } from '../utils/dom';
import { Parser } from './Parser';

export abstract class ContestParser extends Parser {
  public abstract linkSelector: string;
  public abstract problemParser: Parser;

  public canHandlePage(): boolean {
    return document.querySelector(this.linkSelector) !== null;
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);
    const links = [...elem.querySelectorAll(this.linkSelector)].map(el => (el as any).href);
    return this.parseLinks(links);
  }

  protected async parseLinks(links: string[]): Promise<Sendable> {
    const bodies = await this.fetchAll(links);
    const tasks: Task[] = [];

    for (let i = 0; i < bodies.length; i++) {
      const task = await this.problemParser.parse(links[i], bodies[i]);
      tasks.push(task as Task);
    }

    return new Contest(tasks);
  }
}
