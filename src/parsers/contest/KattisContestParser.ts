import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { KattisProblemParser } from '../problem/KattisProblemParser';

export class KattisContestParser extends ContestParser {
  public problemParser: Parser = new KattisProblemParser();
  public linkSelector: string = '#standings > thead > tr > th.problemcolheader-standings > a';

  public getMatchPatterns(): string[] {
    return ['https://open.kattis.com/contests/*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/.*[.]kattis[.]com\/contests\/([a-z0-9]+)(\/standings)?$/];
  }
}
