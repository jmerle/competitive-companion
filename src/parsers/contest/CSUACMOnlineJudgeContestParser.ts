import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { CSUACMOnlineJudgeProblemParser } from '../problem/CSUACMOnlineJudgeProblemParser';

export class CSUACMOnlineJudgeContestParser extends ContestParser {
  public linkSelector: string = 'tbody > tr > td:nth-child(3) > a';
  public problemParser: Parser = new CSUACMOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.csu.edu.cn/csuoj/contest/problemset*'];
  }
}
