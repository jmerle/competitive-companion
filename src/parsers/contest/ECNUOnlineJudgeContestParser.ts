import { Parser } from '../Parser';
import { ECNUOnlineJudgeProblemParser } from '../problem/ECNUOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class ECNUOnlineJudgeContestParser extends SimpleContestParser {
  public linkSelector: string = 'td.left.aligned > a:first-child';
  public problemParser: Parser = new ECNUOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.ecnu.edu.cn/contest/*/'];
  }
}
