import { NowCoderProblemParser } from '../problem/NowCoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class NowCoderContestParser extends SimpleContestParser {
  protected linkSelector = 'table tr td:nth-child(2) a';
  protected problemParser = new NowCoderProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://ac.nowcoder.com/acm/contest/*'];
  }
}
