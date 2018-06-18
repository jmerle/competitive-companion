import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { COJProblemParser } from '../problem/COJProblemParser';

export class COJContestParser extends ContestParser {
  linkSelector: string = '#problem td > a';
  problemParser: Parser = new COJProblemParser();

  getMatchPatterns(): string[] {
    return ['http://coj.uci.cu/contest/cproblems.xhtml*'];
  }

  canHandlePage(): boolean {
    return true;
  }
}
