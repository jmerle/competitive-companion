import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { COJProblemParser } from '../problem/COJProblemParser';

export class COJContestParser extends ContestParser {
  public linkSelector: string = '#problem td > a';
  public problemParser: Parser = new COJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://coj.uci.cu/contest/cproblems.xhtml*'];
  }

  public canHandlePage(): boolean {
    return true;
  }
}
