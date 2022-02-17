import { A2OnlineJudgeProblemParser } from '../problem/A2OnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class A2OnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = 'table tbody tr td a[href^="p?ID="]';
  protected problemParser = new A2OnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://a2oj.com/ladder*'];
  }
}
