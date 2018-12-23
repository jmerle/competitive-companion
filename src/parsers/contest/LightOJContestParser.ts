import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { LightOJProblemParser } from '../problem/LightOJProblemParser';

export class LightOJContestParser extends ContestParser {
  public linkSelector: string = '#mytable > tbody > tr > td > a[class^="user_link"]';
  public problemParser: Parser = new LightOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://lightoj.com/contest_problemset.php*', 'http://www.lightoj.com/contest_problemset.php*'];
  }
}
