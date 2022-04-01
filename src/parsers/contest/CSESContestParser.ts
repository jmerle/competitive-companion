import { CSESProblemParser } from '../problem/CSESProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CSESContestParser extends SimpleContestParser {
  protected linkSelector = '.task-list.contest > .task > a';
  protected problemParser = new CSESProblemParser();

  public getMatchPatterns(): string[] {
    return [
      'https://cses.fi/*/list',
      'https://cses.fi/*/list/',
      'https://www.cses.fi/*/list',
      'https://www.cses.fi/*/list/',
    ];
  }

  public getExcludedMatchPatterns(): string[] {
    return [
      'https://cses.fi/problemset/list',
      'https://cses.fi/problemset/list/',
      'https://www.cses.fi/problemset/list',
      'https://www.cses.fi/problemset/list/',
    ];
  }
}
