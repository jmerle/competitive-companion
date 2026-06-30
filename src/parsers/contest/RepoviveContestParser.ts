import pLimit from 'p-limit';
import { Task } from '../../models/Task';
import { request } from '../../utils/request';
import { RepoviveProblemParser } from '../problem/RepoviveProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

// Repovive serves Next.js-rendered pages and intermittently returns 200 with an
// incomplete HTML shell (no problem content) when several problem URLs from the
// same contest are fetched in parallel. Serializing the fetches keeps every
// response complete; a 7-problem contest stays well under any user-visible delay.
const limit = pLimit(1);

export class RepoviveContestParser extends SimpleContestParser {
  protected linkSelector = 'a[href^="/contests/"][href*="/problems/"]:not([data-slot])';
  protected problemParser = new RepoviveProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://repovive.com/contests/*'];
  }

  protected async parseTask(url: string): Promise<Task> {
    return limit(async () => {
      const body = await this.fetchProblemBody(url);
      return (await this.problemParser.parse(url, body)) as Task;
    });
  }

  private async fetchProblemBody(url: string, attemptsLeft = 3): Promise<string> {
    const body = await request(url);
    if (/<h1\b/i.test(body)) {
      return body;
    }
    if (attemptsLeft > 1) {
      await new Promise(resolve => setTimeout(resolve, 750));
      return this.fetchProblemBody(url, attemptsLeft - 1);
    }
    return body;
  }
}
