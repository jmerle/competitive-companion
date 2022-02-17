import { COJProblemParser } from '../problem/COJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class COJContestParser extends SimpleContestParser {
  protected linkSelector = '#problem td > a';
  protected problemParser = new COJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://coj.uci.cu/contest/cproblems.xhtml*'];
  }

  public canHandlePage(): boolean {
    return true;
  }
}
