import { WincentDragonByteProblemParser } from '../problem/WincentDragonByteProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class WincentDragonByteContestParser extends SimpleContestParser {
  protected linkSelector = 'ul li a[href^="https://wincentdragonbyte.com/problem/"]';
  protected problemParser = new WincentDragonByteProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://wincentdragonbyte.com/problems'];
  }
}
