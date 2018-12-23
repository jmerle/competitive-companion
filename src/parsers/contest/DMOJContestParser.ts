import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { DMOJProblemParser } from '../problem/DMOJProblemParser';

export class DMOJContestParser extends ContestParser {
  public linkSelector: string = '#contest-problems > tbody > tr > td:first-child > a';
  public problemParser: Parser = new DMOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://dmoj.ca/contest/*'];
  }
}
