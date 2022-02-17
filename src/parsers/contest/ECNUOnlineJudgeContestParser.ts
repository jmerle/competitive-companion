import { ECNUOnlineJudgeProblemParser } from '../problem/ECNUOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class ECNUOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = 'td.left.aligned > a:first-child';
  protected problemParser = new ECNUOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.ecnu.edu.cn/contest/*/'];
  }
}
