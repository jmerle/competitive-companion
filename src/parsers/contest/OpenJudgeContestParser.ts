import { OpenJudgeProblemParser } from '../problem/OpenJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class OpenJudgeContestParser extends SimpleContestParser {
  protected linkSelector = '.contest-problem > table td.title > a';
  protected problemParser = new OpenJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://*.openjudge.cn/*/'];
  }
}
