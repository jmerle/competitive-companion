import { CSESProblemParser } from '../problem/CSESProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CSESProblemSetContestParser extends SimpleContestParser {
  protected linkSelector = '.task-list > .task > a';
  protected problemParser = new CSESProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://cses.fi/problemset/',
      'https://cses.fi/problemset',
      'https://www.cses.fi/problemset/',
      'https://www.cses.fi/problemset',
      'https://cses.fi/problemset/list',
      'https://cses.fi/problemset/list/',
      'https://www.cses.fi/problemset/list',
      'https://www.cses.fi/problemset/list/',
    ];
  }
}
