import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { TimusProblemParser } from '../problem/TimusProblemParser';

export class TimusContestParser extends ContestParser {
  public problemParser: Parser = new TimusProblemParser();
  public linkSelector: string = '.problemset td.name > a';

  public getMatchPatterns(): string[] {
    return ['http://acm.timus.ru/problemset.aspx*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^http:\/\/acm[.]timus[.]ru\/problemset[.]aspx\?space=(\d+)(&locale=(en|ru))?$/,
    ];
  }
}
