import { ContestParser } from '../ContestParser';
import { Parser } from '../../Parser';
import { LightOJProblemParser } from '../problem/LightOJProblemParser';

export class LightOJContestParser extends ContestParser {
  linkSelector: string = '#mytable > tbody > tr > td:nth-child(3) > a';
  problemParser: Parser = new LightOJProblemParser();

  getMatchPatterns(): string[] {
    return ['http://www.lightoj.com/contest_problemset.php*'];
  }
}
