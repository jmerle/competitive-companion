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
    const links: string[] = [];
    const seen = new Set<string>();
    for (const element of elem.querySelectorAll(this.linkSelector)) {
      let link: URL;
      try {
        link = new URL(element.getAttribute('href'), url);
      } catch {
        continue;
      }
      if (!patterns.some(pattern => pattern.test(link.href))) {
        continue;
      }
      if (version !== null) {
        link.searchParams.set('v', version);
      }

      const key = new URL(link.href);
      key.hash = '';
      key.pathname = key.pathname.replace(/\/$/, '');
      key.searchParams.sort();
      if (seen.has(key.href)) {
        continue;
      }
      seen.add(key.href);
      links.push(link.href);
    }

    return links;
  }
}
