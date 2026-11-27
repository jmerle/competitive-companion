import pLimit from 'p-limit';
import { Task } from '../../models/Task';
import { htmlToElement } from '../../utils/dom';
import { request } from '../../utils/request';
import { ContestParser } from '../ContestParser';
import { SamCodingProblemParser } from '../problem/SamCodingProblemParser';

const limit = pLimit(1);

export class SamCodingContestParser extends ContestParser<string> {
  private problemParser = new SamCodingProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://samcoding.uz/contests/*'];
  }

  public canHandlePage(): boolean {
    return this.getContestId(window.location.href) !== undefined;
  }

  protected async getTasksToParse(html: string, url: string): Promise<string[]> {
    const urls = this.getProblemUrls(htmlToElement(html), url);
    if (urls.length > 0) {
      return urls;
    }

    // The contest overview does not list the problems, the standings do
    const standingsUrl = `${new URL(url).origin}/contests/${this.getContestId(url)}/standings`;
    return this.getProblemUrls(htmlToElement(await request(standingsUrl)), standingsUrl);
  }

  protected async parseTask(url: string): Promise<Task> {
    return limit(async () => {
      // A problem is available at "/contests/<contest>/problems/<letter>" for the participants of a contest,
      // and at "/problems/<contest>/<letter>" for everyone once the contest is over
      const parsedUrl = new URL(url);
      const contestMatch = /^\/contests\/(\d+)\/problems\/([^/]+)$/.exec(parsedUrl.pathname);
      const archiveMatch = /^\/problems\/(\d+)\/([^/]+)$/.exec(parsedUrl.pathname);

      const candidates = [url];
      if (contestMatch !== null) {
        candidates.push(`${parsedUrl.origin}/problems/${contestMatch[1]}/${contestMatch[2]}`);
      } else if (archiveMatch !== null) {
        candidates.push(`${parsedUrl.origin}/contests/${archiveMatch[1]}/problems/${archiveMatch[2]}`);
      }

      let lastError: unknown;
      for (let i = 0; i < candidates.length; i++) {
        try {
          // Only the last candidate is retried, the others are expected to fail when the problem is not available there
          const body = await request(candidates[i], {}, i === candidates.length - 1 ? 3 : 0);
          return (await this.problemParser.parse(candidates[i], body)) as Task;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError;
    });
  }

  private getProblemUrls(elem: Element, url: string): string[] {
    const parsedUrl = new URL(url);
    const contestId = this.getContestId(url);

    const linkPattern = new RegExp(`^/(?:contests/${contestId}/problems|problems/${contestId})/[^/]+$`);
    const links = [...elem.querySelectorAll('a[href*="/problems/"]')]
      .map(el => new URL(el.getAttribute('href'), parsedUrl))
      .filter(link => link.origin === parsedUrl.origin && linkPattern.test(link.pathname))
      .map(link => link.origin + link.pathname);

    if (links.length > 0) {
      return [...new Set(links)];
    }

    // The standings do not link to the problems, but they do list their letters in the table header
    const letters = [...elem.querySelectorAll('table thead td span.fw-bold')]
      .map(el => el.textContent.trim())
      .filter(letter => /^[A-Za-z][0-9]?$/.test(letter));

    return [...new Set(letters)].map(letter => `${parsedUrl.origin}/problems/${contestId}/${letter}`);
  }

  private getContestId(url: string): string | undefined {
    return /^\/contests\/(\d+)(?:\/|$)/.exec(new URL(url).pathname)?.[1];
  }
}
