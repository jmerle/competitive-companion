import { Parser } from '../Parser';
import { BaekjoonOnlineJudgeProblemParser } from '../problem/BaekjoonOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BaekjoonOnlineJudgeContestParser extends SimpleContestParser {
  public problemParser: Parser = new BaekjoonOnlineJudgeProblemParser();
  public linkSelector: string = 'table > tbody > tr > td:nth-child(2) > a';

  public getMatchPatterns(): string[] {
    return ['https://www.acmicpc.net/workbook/view/*'];
  }
}
