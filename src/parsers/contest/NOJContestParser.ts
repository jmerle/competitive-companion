import { Task } from '../../models/Task';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { NOJProblemParser } from '../problem/NOJProblemParser';

export class NOJContestParser extends ContestParser<string> {
  public getMatchPatterns(): string[] {
    return ['https://acm.njupt.edu.cn/contest/*/board/challenge'];
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const elem = htmlToElement(html);
    return [...elem.querySelectorAll('challenge-container > challenge-item')]
      .map(el => el.getAttribute('onclick'))
      .map(script => script.replace("location.href='", '').replace("'", ''))
      .map(partialUrl => `https://acm.njupt.edu.cn${partialUrl}`);
  }

  protected async parseTask(url: string): Promise<Task> {
    const body = await request(url);
    const parser = new NOJProblemParser();
    const task = await parser.parse(url, body);
    return task as Task;
  }
}
