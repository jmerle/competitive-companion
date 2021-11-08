import { Parser } from '../Parser';
import { PEGJudgeProblemParser } from '../problem/PEGJudgeProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class PEGJudgeContestParser extends SimpleContestParser {
  public linkSelector: string = '#content table tr > td:nth-child(2) a';
  public problemParser: Parser = new PEGJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://wcipeg.com/problems'];
  }
}
