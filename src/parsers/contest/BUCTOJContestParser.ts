import { BUCTOJProblemParser } from '../problem/BUCTOJProblemParser';
import { HUSTOJSyzojContestParser } from './HUSTOJSyzojContestParser';

export class BUCTOJContestParser extends HUSTOJSyzojContestParser {
  protected problemParser = new BUCTOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://buctcoder.com/contest.php*'];
  }
}
