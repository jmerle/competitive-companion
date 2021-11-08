import { Parser } from '../Parser';
import { YukicoderProblemParser } from '../problem/YukicoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class YukicoderContestParser extends SimpleContestParser {
  public problemParser: Parser = new YukicoderProblemParser();
  public linkSelector: string = '#content > .left > table > tbody > tr > td > a[href^="/problems/no"]';

  public getMatchPatterns(): string[] {
    return ['https://yukicoder.me/contests/*'];
  }
}
