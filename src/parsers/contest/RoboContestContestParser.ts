import { RoboContestProblemParser } from '../problem/RoboContestProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class RoboContestContestParser extends SimpleContestParser {
  protected linkSelector = 'table th.text-center.align-middle[title] > a';
  protected problemParser = new RoboContestProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://robocontest.uz/olympiads/*/results'];
  }
}
