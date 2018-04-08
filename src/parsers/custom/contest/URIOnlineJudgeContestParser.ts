import { ContestParser } from '../ContestParser';
import { Parser } from '../../Parser';
import { URIOnlineJudgeProblemParser } from '../problem/URIOnlineJudgeProblemParser';

export class URIOnlineJudgeContestParser extends ContestParser {
  linkSelector: string = '#contest-rank > thead > tr > th > a';
  problemParser: Parser = new URIOnlineJudgeProblemParser();

  getMatchPatterns(): string[] {
    return ['https://www.urionlinejudge.com.br/judge/*/tournaments/rank/*'];
  }
}
