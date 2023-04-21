import { DMOJProblemParser } from '../problem/DMOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class DMOJContestParser extends SimpleContestParser {
  protected linkSelector = '.contest-problems tbody > tr > td:first-child > a';
  protected problemParser = new DMOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://dmoj.ca/contest/*', 'https://arena.moi/contest/*'];
  }
}
