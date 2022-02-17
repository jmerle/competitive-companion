import { CSUACMOnlineJudgeProblemParser } from '../problem/CSUACMOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CSUACMOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = 'tbody > tr > td:nth-child(3) > a';
  protected problemParser = new CSUACMOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.csu.edu.cn/csuoj/contest/problemset*'];
  }
}
