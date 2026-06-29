import { WincentDragonByteProblemParser } from '../problem/WincentDragonByteProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class WincentDragonByteContestParser extends SimpleContestParser {
  // Match both the relative `/problem/<letter>` hrefs the live page renders and
  // the absolute form. `/problems` (the nav "Problems" link) is excluded by the
  // trailing slash in `/problem/`.
  protected linkSelector = 'a[href*="/problem/"]';
  protected problemParser = new WincentDragonByteProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://wincentdragonbyte.com/problems'];
  }
}
