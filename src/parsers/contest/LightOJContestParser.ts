import { LightOJProblemParser } from '../problem/LightOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class LightOJContestParser extends SimpleContestParser {
  protected linkSelector = '.card-body a.page-meta';
  protected problemParser = new LightOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://lightoj.com/contest/*/arena/'];
  }
}
