import { Parser } from '../Parser';
import { POJProblemParser } from '../problem/POJProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class POJContestParser extends SimpleContestParser {
  public linkSelector: string = 'div[align=center] > table tr a';
  public problemParser: Parser = new POJProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://poj.org/showcontest*'];
  }
}
