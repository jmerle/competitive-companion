import { htmlToElement } from '../../utils/dom';
import { QOJProblemParser } from '../problem/QOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class QOJContestParser extends SimpleContestParser {
  protected linkSelector = '.top-buffer-md > .table-responsive > .table tbody td a[href*="/problem/"]';
  protected problemParser = new QOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://qoj.ac/contest/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/qoj\.ac\/contest\/\d+\/?(?:[?#].*)?$/];
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const elem = htmlToElement(html);
    const version = new URL(url).searchParams.get('v');
    const patterns = this.problemParser.getRegularExpressions();
    const links = [...elem.querySelectorAll(this.linkSelector)]
      .map(link => new URL(link.getAttribute('href'), url))
      .filter(link => patterns.some(pattern => pattern.test(link.href)))
      .map(link => {
        if (version !== null && !link.searchParams.has('v')) {
          link.searchParams.set('v', version);
        }
        return link.href;
      });

    return [...new Set(links)];
  }
}
