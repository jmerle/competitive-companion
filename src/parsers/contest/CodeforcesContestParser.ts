import { Contest } from '../../models/Contest';
import { Sendable } from '../../models/Sendable';
import { Task } from '../../models/Task';
import { TaskBuilder } from '../../models/TaskBuilder';
import { htmlToElement } from '../../utils/dom';
import { CodeforcesProblemParser } from '../problem/CodeforcesProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CodeforcesContestParser extends SimpleContestParser {
  protected linkSelector =
    '.problems > tbody > tr > td:first-child > a, ._ProblemsPage_problems > table > tbody > tr > td:first-child > a';
  protected problemParser = new CodeforcesProblemParser();

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
    const esPatterns = patterns.map(pattern => pattern.replace('es.com', '.es'));
    const netPatterns = patterns.map(pattern => pattern.replace('.com', '.net'));

    const httpsPatterns = [...patterns, ...mlPatterns, ...esPatterns, ...netPatterns];
    const httpPatterns = httpsPatterns.map(pattern => pattern.replace('https://', 'http://'));

    return [...httpsPatterns, ...httpPatterns];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^https?:\/\/(.*\.)?codeforces\.(com|ml|es)\/(group\/[a-zA-Z0-9]+\/)?(contest|gym)\/(\d+)(\/problems)?(\?.*)?$/,
      /^https?:\/\/(.*\.)?codeforces\.(com|ml|es)\/edu\/course\/\d+\/lesson\/\d+\/\d+\/practice(\?.*)?$/,
    ];
  }

  public canHandlePage(): boolean {
    if (window.location.pathname.endsWith('/problems')) {
      return true;
    }

    return super.canHandlePage();
  }

  public async parse(url: string, html: string): Promise<Sendable> {
    if (new URL(url).pathname.endsWith('/problems')) {
      return this.parseCompleteProblemset(url, html);
    }

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

  private async parseCompleteProblemset(url: string, html: string): Promise<Sendable> {
    const elem = htmlToElement(html);

    const category = elem.querySelector('.caption').textContent;

    const tasks: Task[] = [];
    for (const problemElem of [...elem.querySelectorAll('.problem-frames > div')]) {
      const task = (await this.problemParser.parse(url, problemElem.innerHTML)) as Task;
      task.group = `${task.group} - ${category}`;

      tasks.push(task);
    }

    return new Contest(tasks);
  }
}
