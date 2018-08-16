import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { URIOnlineJudgeProblemParser } from '../problem/URIOnlineJudgeProblemParser';

export class URIOnlineJudgeContestParser extends ContestParser {
  public linkSelector: string = '#contest-rank > thead > tr > th > a';
  public problemParser: Parser = new URIOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.urionlinejudge.com.br/judge/*/tournaments/rank/*'];
  }
}
