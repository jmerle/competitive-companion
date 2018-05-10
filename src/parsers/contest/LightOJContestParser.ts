import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { LightOJProblemParser } from '../problem/LightOJProblemParser';

export class LightOJContestParser extends ContestParser {
  linkSelector: string = '#mytable > tbody > tr > td > a[class^="user_link"]';
  problemParser: Parser = new LightOJProblemParser();

  getMatchPatterns(): string[] {
    return [
      'http://lightoj.com/contest_problemset.php*',
      'http://www.lightoj.com/contest_problemset.php*'
    ];
  }
}
