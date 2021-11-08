import { Parser } from '../Parser';
import { URIOnlineJudgeProblemParser } from '../problem/URIOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class URIOnlineJudgeContestParser extends SimpleContestParser {
  public linkSelector: string = '#table td.large > a';
  public problemParser: Parser = new URIOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.urionlinejudge.com.br/judge/*/challenges/contest/*'];
  }
}
