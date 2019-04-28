import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { BaekjoonOnlineJudgeProblemParser } from '../problem/BaekjoonOnlineJudgeProblemParser';

export class BaekjoonOnlineJudgeContestParser extends ContestParser {
  public problemParser: Parser = new BaekjoonOnlineJudgeProblemParser();
  public linkSelector: string = 'table > tbody > tr > td:nth-child(2) > a';

  public getMatchPatterns(): string[] {
    return ['https://www.acmicpc.net/workbook/view/*'];
  }
}
