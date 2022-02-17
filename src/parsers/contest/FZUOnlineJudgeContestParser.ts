import { FZUOnlineJudgeProblemParser } from '../problem/FZUOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class FZUOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = '.ct_list_content > table > tbody > tr > td:nth-child(3) > a';
  protected problemParser = new FZUOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.fzu.edu.cn/contest/list.php*'];
  }
}
