import { Task } from '../../models/Task';
import { HDOJProblemParser } from '../problem/HDOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HDOJContestParser extends SimpleContestParser {
  protected linkSelector = 'tr.table_text a';
  protected problemParser = new HDOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.hdu.edu.cn/contests/contest_show.php*'].flatMap(p => [p, p.replace('https', 'http')]);
  }

  protected async parseTask(url: string): Promise<Task> {
    const task = await super.parseTask(url);

    // We need to wait between fetches to prevent getting rate limited
    await new Promise<void>(resolve => {
      setTimeout(() => resolve(), 2000);
    });

    return task;
  }
}
