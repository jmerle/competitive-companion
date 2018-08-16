import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { PEGJudgeProblemParser } from '../problem/PEGJudgeProblemParser';

export class PEGJudgeContestParser extends ContestParser {
  public linkSelector: string = '#content table tr > td:nth-child(2) a';
  public problemParser: Parser = new PEGJudgeProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://wcipeg.com/problems'];
  }
}
