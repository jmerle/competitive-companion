import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { ContestHunterProblemParser } from '../problem/ContestHunterProblemParser';

export class ContestHunterContestParser extends ContestParser {
  public linkSelector: string =
    '.container > .row > .span12 > .table > tbody > tr:nth-child(2) > td:nth-child(2) > .table span[itemprop="name"] > a';
  public problemParser: Parser = new ContestHunterProblemParser();

  public getMatchPatterns(): string[] {
    return ['http://noi-test.zzstep.com/contest/*'];
  }
}
