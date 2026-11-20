import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { CodeSourceProblemParser } from '../problem/CodeSourceProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CodeSourceContestParser extends SimpleContestParser {
  protected linkSelector = '.col--problem.col--problem-name > a';
  protected problemParser = new CodeSourceProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://newoj.daimayuan.top/contest/*'];
  }

  public canHandlePage(): boolean {
    return (document.documentElement.getAttribute('data-page') || '').startsWith('contest');
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    let elem = htmlToElement(html);
    let links = [...elem.querySelectorAll(this.linkSelector)];

    if (links.length === 0) {
      // The contest page itself doesn't show the problem list, it lives on the /problems subpage
      const parsedUrl = new URL(url);
      const contestId = parsedUrl.pathname.split('/')[2];
      const problemsHtml = await request(`${parsedUrl.origin}/contest/${contestId}/problems`);
      elem = htmlToElement(problemsHtml);
      links = [...elem.querySelectorAll(this.linkSelector)];
    }

    return links.map(el => (el as HTMLAnchorElement).href);
  }
}
