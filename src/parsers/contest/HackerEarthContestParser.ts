import { HackerEarthProblemParser } from '../problem/HackerEarthProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HackerEarthContestParser extends SimpleContestParser {
  protected linkSelector = '.problems-table .prob a, .problems-table a.track-problem-link';
  protected problemParser = new HackerEarthProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://www.hackerearth.com/challenge/*/problems/'];
  }
}
