import { ZUFEOJProblemParser } from '../problem/ZUFEOJProblemParser';
import { HUSTOJSyzojContestParser } from './HUSTOJSyzojContestParser';

export class ZUFEOJContestParser extends HUSTOJSyzojContestParser {
  protected problemParser = new ZUFEOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://acm.ocrosoft.com/contest.php*'];
  }
}
