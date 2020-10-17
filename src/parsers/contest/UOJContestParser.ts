import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { UOJProblemParser } from '../problem/UOJProblemParser';

export class UOJContestParser extends ContestParser {
  public problemParser: Parser = new UOJProblemParser();
  public linkSelector: string = '.top-buffer-md > .table-responsive > .table a';

  public getMatchPatterns(): string[] {
    return ['https://uoj.ac/contest/*'];
  }
}
