import { HUSTOJSyzojProblemParser } from './HUSTOJSyzojProblemParser';

export class ZUFEOJProblemParser extends HUSTOJSyzojProblemParser {
  protected judge = 'ZUFEOJ';

  public getMatchPatterns(): string[] {
    return ['http://acm.ocrosoft.com/problem.php*'];
  }
}
