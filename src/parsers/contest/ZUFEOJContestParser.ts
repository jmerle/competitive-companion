import { Task } from '../../models/Task';
import { ZUFEOJProblemParser } from '../problem/ZUFEOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class ZUFEOJContestParser extends SimpleContestParser {
  protected linkSelector = 'table.ui.table.celled > tbody > tr > td:first-child > a';
  protected problemParser = new ZUFEOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.ocrosoft.com/contest.php*', 'https://acm.ocrosoft.com/contest.php*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https?:\/\/acm\.ocrosoft\.com\/contest\.php\?cid=\d+.*$/];
  }

  protected async parseTask(url: string): Promise<Task> {
    // The problem parser uses the site's JSON API, fetching the problem page would just return an empty SPA shell.
    return (await this.problemParser.parse(url, '')) as Task;
  }
}
