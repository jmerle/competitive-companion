import { Parser } from '../Parser';
import { DMOJProblemParser } from '../problem/DMOJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class DMOJContestParser extends SimpleContestParser {
  public linkSelector: string = '#contest-problems > tbody > tr > td:first-child > a';
  public problemParser: Parser = new DMOJProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://dmoj.ca/contest/*'];
  }
}
