import { TimusOnlineJudgeProblemParser } from '../problem/TimusOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class TimusOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = '.problemset td.name > a';
  protected problemParser = new TimusOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['acm.timus.ru', 'timus.online', 'acm-judge.urfu.ru'].map(domain => `https://${domain}/problemset.aspx*`);
  }

  public getRegularExpressions(): RegExp[] {
    return [
      /^https:\/\/acm[.]timus[.]ru\/problemset[.]aspx\?space=(\d+)(&locale=(en|ru))?$/,
      /^https:\/\/timus[.]online\/problemset[.]aspx\?space=(\d+)(&locale=(en|ru))?$/,
    ];
  }
}
