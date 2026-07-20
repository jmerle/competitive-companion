import { htmlToElement } from '../../utils/dom';
import { LSYOIProblemParser } from '../problem/LSYOIProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class LSYOIContestParser extends SimpleContestParser {
  protected linkSelector = '.col--problem-name > a';
  protected problemParser = new LSYOIProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://lsyoi.top:81/training/*', 'http://lsyoi.top:81/contest/*'];
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const elem = htmlToElement(html);
    return [...elem.querySelectorAll(this.linkSelector)].map(el => new URL((el as HTMLAnchorElement).getAttribute('href'), url).href);
  }
}
