import { Task } from '../models/Task';
import { htmlToElement } from '../utils/dom';
import { request } from '../utils/request';
import { ContestParser } from './ContestParser';
import { Parser } from './Parser';

export abstract class SimpleContestParser extends ContestParser<string> {
  protected abstract linkSelector: string;
  protected abstract problemParser: Parser;

  public canHandlePage(): boolean {
    return document.querySelector(this.linkSelector) !== null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const elem = htmlToElement(html);
    return [...elem.querySelectorAll(this.linkSelector)].map(el => (el as any).href);
  }

  protected async parseTask(url: string): Promise<Task> {
    const body = await request(url);
    const task = await this.problemParser.parse(url, body);
    return task as Task;
  }
}
