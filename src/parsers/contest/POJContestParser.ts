import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { POJProblemParser } from '../problem/POJProblemParser';

export class POJContestParser extends ContestParser {
  linkSelector: string = 'div[align=center] > table tr a';
  problemParser: Parser = new POJProblemParser();

  getMatchPatterns(): string[] {
    return ['http://poj.org/showcontest*'];
  }
}
