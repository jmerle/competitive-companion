import { UniversalCupProblemParser } from '../problem/UniversalCupProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class UniversalCupContestParser extends SimpleContestParser {
  protected linkSelector = '.table-text-center > tbody > tr > td > a';
  protected problemParser = new UniversalCupProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://contest.ucup.ac/contest/*'];
  }
}
