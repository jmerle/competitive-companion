import { Parser } from '../Parser';
import { COJProblemParser } from '../problem/COJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class COJContestParser extends SimpleContestParser {
  public linkSelector: string = '#problem td > a';
  public problemParser: Parser = new COJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://coj.uci.cu/contest/cproblems.xhtml*'];
  }

  public canHandlePage(): boolean {
    return true;
  }
}
