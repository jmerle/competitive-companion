import { AlgoZenithProblemParser } from '../problem/AlgoZenithProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class AlgoZenithContestParser extends SimpleContestParser {
  protected problemParser = new AlgoZenithProblemParser();

  protected linkSelector = 'a[href*="/problems/"]';

  public getMatchPatterns(): string[] {
    return [
      'https://maang.in/*',
    ];
  }
}