import { HUSTOJSyzojProblemParser } from './HUSTOJSyzojProblemParser';

export class HUSTOJProblemParser extends HUSTOJSyzojProblemParser {
  protected judge = 'HUSTOJ';

  public getMatchPatterns(): string[] {
    return ['https://hustoj.org/problem/*'];
  }
}
