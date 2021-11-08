import { Parser } from '../Parser';
import { HihoCoderProblemParser } from '../problem/HihoCoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HihoCoderContestParser extends SimpleContestParser {
  public linkSelector: string = '.contest-problems td.id > a';
  public problemParser: Parser = new HihoCoderProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://hihocoder.com/contest/*/problems'];
  }
}
