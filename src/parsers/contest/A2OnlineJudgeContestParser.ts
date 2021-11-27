import { Parser } from '../Parser';
import { A2OnlineJudgeProblemParser } from '../problem/A2OnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class A2OnlineJudgeContestParser extends SimpleContestParser {
  public linkSelector: string = 'table tbody tr td a[href^="p?ID="]';
  public problemParser: Parser = new A2OnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://a2oj.com/ladder*'];
  }
}
