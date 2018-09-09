import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { TimusOnlineJudgeProblemParser } from '../problem/TimusOnlineJudgeProblemParser';

export class TimusOnlineJudgeContestParser extends ContestParser {
  public problemParser: Parser = new TimusOnlineJudgeProblemParser();
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
