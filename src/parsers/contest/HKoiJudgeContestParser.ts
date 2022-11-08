import { HKoiJudgeProblemParser } from '../problem/HKoiJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HKoiJudgeContestParser extends SimpleContestParser {
  protected linkSelector = 'table.table-hover tbody tr td:nth-child(2) a';
  protected problemParser = new HKoiJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://judge.hkoi.org/contest/*'];
  }
}
