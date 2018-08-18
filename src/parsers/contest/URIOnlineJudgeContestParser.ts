import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { URIOnlineJudgeProblemParser } from '../problem/URIOnlineJudgeProblemParser';

export class URIOnlineJudgeContestParser extends ContestParser {
  public linkSelector: string = '#table td.large > a';
  public problemParser: Parser = new URIOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.urionlinejudge.com.br/judge/*/challenges/contest/*'];
  }
}
