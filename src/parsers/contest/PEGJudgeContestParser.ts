import { PEGJudgeProblemParser } from '../problem/PEGJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class PEGJudgeContestParser extends SimpleContestParser {
  protected linkSelector = '#content table tr > td:nth-child(2) a';
  protected problemParser = new PEGJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://wcipeg.com/problems'];
  }
}
