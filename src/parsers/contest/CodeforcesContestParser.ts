import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { CodeforcesProblemParser } from '../problem/CodeforcesProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CodeforcesContestParser extends SimpleContestParser {
  public linkSelector: string =
    '.problems > tbody > tr > td:first-child > a, ._ProblemsPage_problems > table > tbody > tr > td:first-child > a';
  public problemParser: CodeforcesProblemParser = new CodeforcesProblemParser();

  public getMatchPatterns(): string[] {
    const patterns: string[] = [];

    [
      'https://codeforces.com/contest/*',
      'https://codeforces.com/gym/*',
      'https://codeforces.com/group/*/contest/*',
      'https://codeforces.com/edu/course/*/lesson/*/*/practice',
    ].forEach(pattern => {
      patterns.push(pattern);
      patterns.push(pattern.replace('https://codeforces.com', 'https://*.codeforces.com'));
    });

    const mlPatterns = patterns.map(pattern => pattern.replace('.com', '.ml'));
    const esPatterns = patterns.map(pattern => pattern.replace('codeforces.com', 'codeforc.es'));

    return patterns.concat(mlPatterns).concat(esPatterns);
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^https?:\/\/(.*\.)?codeforces[.](com|ml|es)\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)(\?.*)?$/,
      /^https?:\/\/(.*\.)?codeforces[.](com|ml|es)\/edu\/course\/\d+\/lesson\/\d+\/\d+\/practice(\?.*)?$/,
    ];
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    // Some contests provide the problem statements inside a PDF file.
    // These cannot be parsed with the regular CodeforcesProblemParser.
    //
    // We try to detect whether the contest provides problems in a PDF by
    // fetching the first URL and checking whether it redirects to a /attachments url.
    //
    // Example contest which uses a PDF for problem statements: https://codeforces.com/gym/100524

    const elem = htmlToElement(html);

    const firstLink = (elem.querySelector(this.linkSelector) as HTMLLinkElement).href;
    const firstLinkResponse = await fetch(firstLink, { redirect: 'follow' });

    if (firstLinkResponse.url.endsWith('/attachments')) {
      return this.parseFromContestPage(url, html);
    } else {
      return super.parse(url, html);
    }
  }

  private async parseFromContestPage(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    const contestName = elem
      .querySelector('#sidebar > div > .rtable')
      .querySelector('a')
      .textContent.replace('\n', ' ')
      .trim();

    const rowSelector = '.problems > tbody > tr:not(:first-child)';
    const tasks = [...elem.querySelectorAll(rowSelector)].map(row => {
      const task = new TaskBuilder('Codeforces').setCategory(contestName);

      this.problemParser.parseContestRow(row, task);

      return task.build();
    });

    return new Contest(tasks);
  }
}
