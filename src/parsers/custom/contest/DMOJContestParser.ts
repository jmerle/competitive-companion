import { ContestParser } from '../ContestParser';
import { Parser } from '../../Parser';
import { DMOJProblemParser } from '../problem/DMOJProblemParser';

export class DMOJContestParser extends ContestParser {
  linkSelector: string = '#contest-problems > tbody > tr > td:first-child > a';
  problemParser: Parser = new DMOJProblemParser();

  getMatchPatterns(): string[] {
    return ['https://dmoj.ca/contest/*'];
  }
}
