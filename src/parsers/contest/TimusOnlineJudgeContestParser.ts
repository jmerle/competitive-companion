import { TimusOnlineJudgeProblemParser } from '../problem/TimusOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class TimusOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = '.problemset td.name > a';
  protected problemParser = new TimusOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://acm.timus.ru/problemset.aspx*'];
  }

  public getRegularExpressions(): RegExp[] {
    return [/^https:\/\/acm[.]timus[.]ru\/problemset[.]aspx\?space=(\d+)(&locale=(en|ru))?$/];
  }
}
