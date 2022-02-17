import { KattisProblemParser } from '../problem/KattisProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class KattisContestParser extends SimpleContestParser {
  protected linkSelector = '#standings > thead > tr > th.problemcolheader-standings > a';
  protected problemParser = new KattisProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://open.kattis.com/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/.*[.]kattis[.]com\/contests\/([a-z0-9]+)(\/standings)?$/];
  }
}
