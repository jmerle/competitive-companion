import { Parser } from '../Parser';
import { HackerEarthProblemParser } from '../problem/HackerEarthProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HackerEarthContestParser extends SimpleContestParser {
  public linkSelector: string = '.problems-table .prob a, .problems-table a.track-problem-link';
  public problemParser: Parser = new HackerEarthProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/challenge/*/problems/'];
  }
}
