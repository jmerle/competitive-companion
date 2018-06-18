import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { PEGJudgeProblemParser } from '../problem/PEGJudgeProblemParser';

export class PEGJudgeContestParser extends ContestParser {
  linkSelector: string = '#content table tr > td:nth-child(2) a';
  problemParser: Parser = new PEGJudgeProblemParser();

  getMatchPatterns(): string[] {
    return ['https://wcipeg.com/problems'];
  }
}
