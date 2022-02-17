import { AtCoderProblemParser } from '../problem/AtCoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class AtCoderContestParser extends SimpleContestParser {
  protected linkSelector = 'table tr td:first-child a';
  protected problemParser = new AtCoderProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://atcoder.jp/contests/*/tasks'];
  }
}
