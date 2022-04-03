import { BUCTOJProblemParser } from '../problem/BUCTOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BUCTOJContestParser extends SimpleContestParser {
  protected linkSelector = 'table.ui.selectable > tbody > tr > td:nth-child(2) > a';
  protected problemParser = new BUCTOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://buctcoder.com/contest.php*'];
  }
}
