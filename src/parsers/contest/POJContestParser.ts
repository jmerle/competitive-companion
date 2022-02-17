import { POJProblemParser } from '../problem/POJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class POJContestParser extends SimpleContestParser {
  protected linkSelector = 'div[align=center] > table tr a';
  protected problemParser = new POJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://poj.org/showcontest*'];
  }
}
