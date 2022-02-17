import { ContestHunterProblemParser } from '../problem/ContestHunterProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class ContestHunterContestParser extends SimpleContestParser {
  protected linkSelector =
    '.container > .row > .span12 > .table > tbody > tr:nth-child(2) > td:nth-child(2) > .table span[itemprop="name"] > a';
  protected problemParser = new ContestHunterProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://noi-test.zzstep.com/contest/*'];
  }
}
