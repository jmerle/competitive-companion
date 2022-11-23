import { HUSTOJSyzojProblemParser } from './HUSTOJSyzojProblemParser';

export class BUCTOJProblemParser extends HUSTOJSyzojProblemParser {
  protected judge = 'BUCTOJ';

  public getMatchPatterns(): string[] {
    return ['https://buctcoder.com/problem.php*'];
  }
}
