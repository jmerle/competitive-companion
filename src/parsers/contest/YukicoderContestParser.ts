import { ContestParser } from '../ContestParser';
import { Parser } from '../Parser';
import { YukicoderProblemParser } from '../problem/YukicoderProblemParser';

export class YukicoderContestParser extends ContestParser {
  public problemParser: Parser = new YukicoderProblemParser();
  public linkSelector: string = '#content > .left > table > tbody > tr > td > a[href^="/problems/no"]';

  public getMatchPatterns(): string[] {
    return ['https://yukicoder.me/contests/*'];
  }
}
