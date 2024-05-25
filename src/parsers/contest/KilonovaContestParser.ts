import { KilonovaProblemParser } from '../problem/KilonovaProblemParser';
import { SimpleContestParser } from '../SimpleContestParser';

export class KilonovaContestParser extends SimpleContestParser {
  protected linkSelector = 'div.reset-list > ul > li > a[href^="/"]';
  protected problemParser = new KilonovaProblemParser();

  public getMatchPatterns(): string[] {
    return ['https://kilonova.ro/contests/*', 'https://kilonova.ro/problems/*'];
  }
}
