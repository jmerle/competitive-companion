import pLimit from 'p-limit';
import { Task } from '../../models/Task';
import { request } from '../../utils/request';
import { DOJProblemParser } from '../problem/DOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

// The public API is limited to roughly 120 requests per minute per IP,
// so the problem pages are requested one at a time to stay on the safe side
const limit = pLimit(1);

export class DOJContestParser extends SimpleContestParser {
  protected linkSelector = '.contest-problem-section a[href*="/problems/"]';
  protected problemParser = new DOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://doj.kr/*/contests/*'];
  }

  protected async parseTask(url: string): Promise<Task> {
    return limit(async () => {
      // The contest links to "/problems/<id>?contest=<uuid>", which is only served to contest participants
      // After the contest the problems are public, but only without the contest in the URL
      const plainUrl = url.split('?')[0];
      const urls = plainUrl === url ? [url] : [url, plainUrl];

      let lastError: unknown;
      for (const candidate of urls) {
        try {
          const body = await request(candidate);
          return (await this.problemParser.parse(candidate, body)) as Task;
        } catch (err) {
          lastError = err;
        }
      }

      throw lastError;
    });
  }
}
