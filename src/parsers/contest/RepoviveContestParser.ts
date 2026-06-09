import { RepoviveProblemParser } from '../problem/RepoviveProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class RepoviveContestParser extends SimpleContestParser {
  protected linkSelector = 'a[href^="/contests/"][href*="/problems/"]:not([data-slot])';
  protected problemParser = new RepoviveProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://repovive.com/contests/*'];
  }
}
