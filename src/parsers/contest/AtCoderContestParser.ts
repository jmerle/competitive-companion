import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { AtCoderProblemParser } from '../problem/AtCoderProblemParser';

export class AtCoderContestParser extends ContestParser {
  problemParser: Parser = new AtCoderProblemParser();
  linkSelector: string = 'table tr td:first-child a';

  getMatchPatterns(): string[] {
    return ['https://*.contest.atcoder.jp/assignments'];
  }
}
