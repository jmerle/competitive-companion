import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { POJProblemParser } from '../problem/POJProblemParser';

export class POJContestParser extends ContestParser {
  public linkSelector: string = 'div[align=center] > table tr a';
  public problemParser: Parser = new POJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://poj.org/showcontest*'];
  }
}
