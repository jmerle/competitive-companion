import { Task } from '../../models/Task';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { EolympBasecampProblemParser } from '../problem/EolympBasecampProblemParser';

export class EolympBasecampContestParser extends ContestParser<string> {
  private linkSelector = 'a[href*="/compete/"][href*="/problems/"]';
  private problemParser = new EolympBasecampProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://eolymp.com/compete/*'];
  }

  public canHandlePage(): boolean {
    return document.querySelector(this.linkSelector) !== null;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const elem = htmlToElement(html);

    // Problems are linked from both the sidebar and the overview page's problems card
    const urls = [...elem.querySelectorAll(this.linkSelector)].map(el => (el as any).href);
    return [...new Set(urls)];
  }

  protected async parseTask(url: string): Promise<Task> {
    return this.problemParser.parseHtml(url, await request(url));
  }
}
