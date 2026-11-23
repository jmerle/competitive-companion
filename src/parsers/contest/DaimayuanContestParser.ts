import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { DAIMAYUAN_DOMAIN, DaimayuanProblemParser } from '../problem/DaimayuanProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

/**
 * Parses all problems of a contest on the current bs.daimayuan.top theme.
 * The contest detail page does not contain the problem list, so the
 * /contest/{id}/problems subpage is fetched when needed.
 */
export class DaimayuanContestParser extends SimpleContestParser {
  protected linkSelector =
    '.contest-problems-table .contest-problem-title a[href^="/p/"], .dmybs-seo li > a[href^="/p/"]';
  protected problemParser = new DaimayuanProblemParser();

  public getMatchPatterns(): string[] {
    return [`https://${DAIMAYUAN_DOMAIN}/contest/*`];
  }

  public canHandlePage(): boolean {
    if (document.querySelector('.contest-problems-table') !== null) {
      return true;
    }

    try {
      const data = JSON.parse(document.querySelector('#hydro-data')?.textContent || 'null');
      return typeof data?.pageName === 'string' && data.pageName.startsWith('contest');
    } catch (err) {
      return false;
    }
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    let elem = htmlToElement(html);
    let links = [...elem.querySelectorAll(this.linkSelector)];

    if (links.length === 0) {
      const parsedUrl = new URL(url);
      const contestId = parsedUrl.pathname.split('/')[2];
      const problemsHtml = await request(`${parsedUrl.origin}/contest/${contestId}/problems`);
      elem = htmlToElement(problemsHtml);
      links = [...elem.querySelectorAll(this.linkSelector)];
    }

    const seen = new Set<string>();
    const tasks: string[] = [];

    for (const link of links) {
      const href = (link as HTMLAnchorElement).getAttribute('href');
      if (href === null) {
        continue;
      }

      const absoluteUrl = new URL(href, url).href;
      if (!seen.has(absoluteUrl)) {
        seen.add(absoluteUrl);
        tasks.push(absoluteUrl);
      }
    }

    return tasks;
  }
}
