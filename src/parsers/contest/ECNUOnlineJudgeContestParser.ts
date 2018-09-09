import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { ECNUOnlineJudgeProblemParser } from '../problem/ECNUOnlineJudgeProblemParser';

export class ECNUOnlineJudgeContestParser extends ContestParser {
  public linkSelector: string = 'td.left.aligned > a:first-child';
  public problemParser: Parser = new ECNUOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.ecnu.edu.cn/contest/*/'];
  }
}
