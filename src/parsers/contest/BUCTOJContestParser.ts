import { Parser } from '../Parser';
import { BUCTOJProblemParser } from '../problem/BUCTOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BUCTOJContestParser extends SimpleContestParser {
  public linkSelector: string = 'table.ui.selectable > tbody > tr > td:nth-child(2) > a';
  public problemParser: Parser = new BUCTOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://buctcoder.com/contest.php*', 'http://182.92.175.181/contest.php*'];
  }
}
