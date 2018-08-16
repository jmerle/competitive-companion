import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { AtCoderProblemParser } from '../problem/AtCoderProblemParser';

export class AtCoderContestParser extends ContestParser {
  public problemParser: Parser = new AtCoderProblemParser();
  public linkSelector: string = 'table tr td:first-child a';

  public getMatchPatterns(): string[] {
    return [
      'https://*.contest.atcoder.jp/assignments',
      'https://beta.atcoder.jp/contests/*/tasks',
    ];
  }
}
