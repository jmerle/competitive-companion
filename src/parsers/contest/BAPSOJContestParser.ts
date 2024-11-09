import { BAPSOJProblemParser } from '../problem/BAPSOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class BAPSOJContestParser extends SimpleContestParser {
  protected linkSelector = 'ul > a';
  protected problemParser = new BAPSOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://bapsoj.org/contests/*'];
  }
}
