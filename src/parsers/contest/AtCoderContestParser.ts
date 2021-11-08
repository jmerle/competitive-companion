import { Parser } from '../Parser';
import { AtCoderProblemParser } from '../problem/AtCoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class AtCoderContestParser extends SimpleContestParser {
  public problemParser: Parser = new AtCoderProblemParser();
  public linkSelector: string = 'table tr td:first-child a';

  public getMatchPatterns(): string[] {
    return ['https://atcoder.jp/contests/*/tasks'];
  }
}
