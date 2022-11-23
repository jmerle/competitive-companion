import { HKOIOnlineJudgeProblemParser } from '../problem/HKOIOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HKOIOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = 'table.table-hover tbody tr td:nth-child(2) a';
  protected problemParser = new HKOIOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://judge.hkoi.org/contest/*'];
  }
}
