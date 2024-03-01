import { BaekjoonOnlineJudgeProblemParser } from '../problem/BaekjoonOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BaekjoonOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = 'table > tbody > tr > td:nth-child(2) > a';
  protected problemParser = new BaekjoonOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.acmicpc.net/workbook/view/*'];
  }
}
