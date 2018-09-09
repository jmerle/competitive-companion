import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { HihoCoderProblemParser } from '../problem/HihoCoderProblemParser';

export class HihoCoderContestParser extends ContestParser {
  public linkSelector: string = '.contest-problems td.id > a';
  public problemParser: Parser = new HihoCoderProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://hihocoder.com/contest/*/problems'];
  }
}
