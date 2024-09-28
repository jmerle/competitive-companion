import { NBUTOnlineJudgeProblemParser } from '../problem/NBUTOnlineJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class NBUTOnlineJudgeContestParser extends SimpleContestParser {
  protected linkSelector = '#problemlist td.br > a';
  protected problemParser = new NBUTOnlineJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://ac.2333.moe/Contest/view/id/*.xhtml'];
  }
}
