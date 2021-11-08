import { Parser } from '../Parser';
import { TimusOnlineJudgeProblemParser } from '../problem/TimusOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class TimusOnlineJudgeContestParser extends SimpleContestParser {
  public problemParser: Parser = new TimusOnlineJudgeProblemParser();
  public linkSelector: string = '.problemset td.name > a';

  public getMatchPatterns(): string[] {
    return ['https://acm.timus.ru/problemset.aspx*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/acm[.]timus[.]ru\/problemset[.]aspx\?space=(\d+)(&locale=(en|ru))?$/];
  }
}
