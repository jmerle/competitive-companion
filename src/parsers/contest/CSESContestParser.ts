import { Parser } from '../Parser';
import { CSESProblemParser } from '../problem/CSESProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CSESContestParser extends SimpleContestParser {
  public problemParser: Parser = new CSESProblemParser();
  public linkSelector: string = '.task-list.contest > .task > a';

  public getMatchPatterns(): string[] {
    return ['https://cses.fi/*/list', 'https://cses.fi/*/list/'];
  }

  public getExcludedMatchPatterns(): string[] {
    return ['https://cses.fi/problemset/list', 'https://cses.fi/problemset/list/'];
  }
}
