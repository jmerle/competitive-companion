import { Parser } from '../Parser';
import { FZUOnlineJudgeProblemParser } from '../problem/FZUOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class FZUOnlineJudgeContestParser extends SimpleContestParser {
  public linkSelector: string = '.ct_list_content > table > tbody > tr > td:nth-child(3) > a';
  public problemParser: Parser = new FZUOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.fzu.edu.cn/contest/list.php*'];
  }
}
