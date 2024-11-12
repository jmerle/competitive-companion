import { YukicoderProblemParser } from '../problem/YukicoderProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class YukicoderContestParser extends SimpleContestParser {
  protected linkSelector = '#content > table > tbody > tr > td > a[href^="/problems/no"]';
  protected problemParser = new YukicoderProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://yukicoder.me/contests/*'];
  }
}
