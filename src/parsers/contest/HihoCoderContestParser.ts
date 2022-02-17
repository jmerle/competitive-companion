import { HihoCoderProblemParser } from '../problem/HihoCoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class HihoCoderContestParser extends SimpleContestParser {
  protected linkSelector = '.contest-problems td.id > a';
  protected problemParser = new HihoCoderProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://hihocoder.com/contest/*/problems'];
  }
}
