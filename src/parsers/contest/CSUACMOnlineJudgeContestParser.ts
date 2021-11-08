import { Parser } from '../Parser';
import { CSUACMOnlineJudgeProblemParser } from '../problem/CSUACMOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class CSUACMOnlineJudgeContestParser extends SimpleContestParser {
  public linkSelector: string = 'tbody > tr > td:nth-child(3) > a';
  public problemParser: Parser = new CSUACMOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.csu.edu.cn/csuoj/contest/problemset*'];
  }
}
